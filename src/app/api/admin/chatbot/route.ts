/**
 * Chatbot Management API — Conversational AI configuration & monitoring
 * GET    /api/admin/chatbot — List config, intents, conversations
 * POST   /api/admin/chatbot — Create/update intents, update config
 * DELETE /api/admin/chatbot — Remove intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const section = searchParams.get('section'); // config | intents | conversations

    if (section === 'config') {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ config: data || null });
    }

    if (section === 'intents') {
      const { data, error } = await supabase
        .from('chatbot_intents')
        .select('*')
        .order('priority', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ intents: data || [], total: (data || []).length });
    }

    if (section === 'conversations') {
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');

      let query = supabase
        .from('chatbot_conversations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const conversations = data || [];
      return NextResponse.json({
        conversations,
        total: count || 0,
        open: conversations.filter(c => c.status === 'open').length,
        resolved: conversations.filter(c => c.status === 'resolved').length,
        escalated: conversations.filter(c => c.status === 'escalated').length,
      });
    }

    // Default: return everything
    const [configRes, intentsRes, convoRes] = await Promise.all([
      supabase.from('chatbot_config').select('*').limit(1).single(),
      supabase.from('chatbot_intents').select('*').order('priority', { ascending: false }),
      supabase.from('chatbot_conversations').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(25),
    ]);

    const conversations = convoRes.data || [];

    return NextResponse.json({
      config: configRes.data || null,
      intents: intentsRes.data || [],
      conversations,
      conversationTotal: convoRes.count || 0,
      metrics: {
        totalConversations: convoRes.count || 0,
        open: conversations.filter(c => c.status === 'open').length,
        resolved: conversations.filter(c => c.status === 'resolved').length,
        escalated: conversations.filter(c => c.status === 'escalated').length,
        avgSatisfaction: conversations.length > 0
          ? (conversations.reduce((sum, c) => sum + (c.satisfaction_score || 0), 0) / conversations.filter(c => c.satisfaction_score).length).toFixed(2)
          : '0',
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Chatbot API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load chatbot data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'update_config') {
      const { provider, model, systemPrompt, temperature, maxTokens, channels, escalationThreshold, maxBotTurns, enabled } = body;

      // Check if config exists
      const { data: existing } = await supabase.from('chatbot_config').select('id').limit(1).single();

      const configData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (provider !== undefined) configData.provider = provider;
      if (model !== undefined) configData.model = model;
      if (systemPrompt !== undefined) configData.system_prompt = systemPrompt;
      if (temperature !== undefined) configData.temperature = temperature;
      if (maxTokens !== undefined) configData.max_tokens = maxTokens;
      if (channels !== undefined) configData.channels = channels;
      if (escalationThreshold !== undefined) configData.escalation_threshold = escalationThreshold;
      if (maxBotTurns !== undefined) configData.max_bot_turns = maxBotTurns;
      if (enabled !== undefined) configData.enabled = enabled;

      if (existing) {
        const { error } = await supabase.from('chatbot_config').update(configData).eq('id', existing.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { error } = await supabase.from('chatbot_config').insert(configData);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'create_intent') {
      const { name, displayName, samplePhrases, responseTemplate, category, priority } = body;
      if (!name || !displayName) {
        return NextResponse.json({ error: 'name and displayName are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('chatbot_intents')
        .insert({
          name,
          display_name: displayName,
          sample_phrases: samplePhrases || [],
          response_template: responseTemplate || '',
          category: category || 'general',
          priority: priority || 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return NextResponse.json({ error: 'Intent with this name already exists' }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, intent: data });
    }

    if (action === 'update_intent') {
      const { id, ...updates } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
      if (updates.samplePhrases !== undefined) updateData.sample_phrases = updates.samplePhrases;
      if (updates.responseTemplate !== undefined) updateData.response_template = updates.responseTemplate;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.priority !== undefined) updateData.priority = updates.priority;

      const { error } = await supabase.from('chatbot_intents').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Chatbot API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process chatbot action' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });

    const { error } = await supabase.from('chatbot_intents').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Chatbot API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete intent' }, { status: 500 });
  }
}
