/**
 * Demand Forecasting API — Inventory prediction & restock management
 * GET  /api/admin/forecasting — List forecasts, restock alerts, metrics
 * POST /api/admin/forecasting — Generate forecast, create restock order, update config
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const section = searchParams.get('section');

    if (section === 'forecasts') {
      const horizon = searchParams.get('horizon');
      let query = supabase
        .from('demand_forecasts')
        .select('*', { count: 'exact' })
        .order('days_until_stockout', { ascending: true, nullsFirst: false })
        .limit(100);

      if (horizon) query = query.eq('forecast_horizon', horizon);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ forecasts: data || [], total: count || 0 });
    }

    if (section === 'alerts') {
      const urgency = searchParams.get('urgency');
      const status = searchParams.get('status');

      let query = supabase
        .from('restock_alerts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

      if (urgency && urgency !== 'all') query = query.eq('urgency', urgency);
      if (status && status !== 'all') query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ alerts: data || [], total: count || 0 });
    }

    // Default: return everything with metrics
    const [forecastsRes, alertsRes] = await Promise.all([
      supabase.from('demand_forecasts').select('*', { count: 'exact' }).order('days_until_stockout', { ascending: true, nullsFirst: false }).limit(50),
      supabase.from('restock_alerts').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
    ]);

    const forecasts = forecastsRes.data || [];
    const alerts = alertsRes.data || [];

    return NextResponse.json({
      forecasts,
      totalForecasts: forecastsRes.count || 0,
      alerts,
      totalAlerts: alertsRes.count || 0,
      metrics: {
        stockoutRisk: forecasts.filter(f => (f.days_until_stockout || 999) <= 7).length,
        overstockItems: forecasts.filter(f => f.restock_recommendation === 'overstock').length,
        avgAccuracy: forecasts.length > 0
          ? (forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0) / forecasts.length).toFixed(1)
          : '0',
        criticalAlerts: alerts.filter(a => a.urgency === 'critical').length,
        pendingRestocks: alerts.filter(a => a.status === 'pending').length,
        nextRestockDue: alerts.find(a => a.status === 'pending')?.product_name || 'None',
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Forecasting API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load forecasting data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'create_forecast') {
      const { productId, productName, currentStock, avgDailySales, predictedDemand7d, predictedDemand30d, predictedDemand90d, confidence, seasonalPattern } = body;
      if (!productName) {
        return NextResponse.json({ error: 'productName is required' }, { status: 400 });
      }

      const daysUntilStockout = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : null;
      let recommendation = 'adequate';
      if (daysUntilStockout !== null) {
        if (daysUntilStockout <= 3) recommendation = 'order now';
        else if (daysUntilStockout <= 14) recommendation = 'order soon';
        else if (currentStock > (predictedDemand90d || 0) * 1.5) recommendation = 'overstock';
      }

      const { data, error } = await supabase
        .from('demand_forecasts')
        .insert({
          product_id: productId || null,
          product_name: productName,
          current_stock: currentStock || 0,
          avg_daily_sales: avgDailySales || 0,
          predicted_demand_7d: predictedDemand7d || 0,
          predicted_demand_30d: predictedDemand30d || 0,
          predicted_demand_90d: predictedDemand90d || 0,
          days_until_stockout: daysUntilStockout,
          confidence: confidence || 0,
          seasonal_pattern: seasonalPattern || {},
          restock_recommendation: recommendation,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, forecast: data });
    }

    if (action === 'create_restock_alert') {
      const { productId, productName, supplierId, supplierName, currentStock, reorderPoint, recommendedQty, estimatedCost, urgency, leadTimeDays } = body;
      if (!productName) {
        return NextResponse.json({ error: 'productName is required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('restock_alerts')
        .insert({
          product_id: productId || null,
          product_name: productName,
          supplier_id: supplierId || null,
          supplier_name: supplierName || null,
          current_stock: currentStock || 0,
          reorder_point: reorderPoint || 0,
          recommended_qty: recommendedQty || 0,
          estimated_cost: estimatedCost || 0,
          urgency: urgency || 'ok',
          lead_time_days: leadTimeDays || 7,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, alert: data });
    }

    if (action === 'update_alert_status') {
      const { id, status } = body;
      if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });

      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'ordered') updateData.ordered_at = new Date().toISOString();

      const { error } = await supabase.from('restock_alerts').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Forecasting API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process forecasting action' }, { status: 500 });
  }
}
