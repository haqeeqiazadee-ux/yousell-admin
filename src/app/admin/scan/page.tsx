'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScanResult {
  scanId: string;
  mode: string;
  totalProducts: number;
  platforms: string[];
  duration: number;
}

interface ScanHistory {
  id: string;
  mode: string;
  status: string;
  product_count: number;
  created_at: string;
}

export default function ScanPage() {
  const [mode, setMode] = useState<'quick' | 'full' | 'client'>('quick');
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch('/api/admin/scan');
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.scans || []);
    } catch {
      // History fetch is non-critical
    }
  }

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(
    (jobId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/scan?jobId=${jobId}`);
          if (!res.ok) return;

          const data = await res.json();

          if (typeof data.progress === 'number') {
            setProgress(data.progress);
          }

          if (data.status === 'completed') {
            stopPolling();
            setScanning(false);
            setProgress(100);
            setCurrentJobId(null);
            if (data.data) {
              setResult(data.data);
            }
            fetchHistory();
          } else if (data.status === 'failed') {
            stopPolling();
            setScanning(false);
            setCurrentJobId(null);
            setError(data.data?.error || 'Scan failed');
          }
        } catch {
          // Polling errors are non-critical, will retry on next interval
        }
      }, 2000);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  async function startScan() {
    setScanning(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Scan failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.jobId) {
        setCurrentJobId(data.jobId);
        pollJobStatus(data.jobId);
      } else {
        setScanning(false);
        setResult(data);
        setProgress(100);
        fetchHistory();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred during scan');
      setScanning(false);
    }
  }

  async function cancelScan() {
    if (!currentJobId) return;

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: currentJobId }),
      });

      if (res.ok) {
        stopPolling();
        setScanning(false);
        setCurrentJobId(null);
        setProgress(0);
        setError('Scan cancelled by user');
      } else {
        setError('Failed to cancel scan');
      }
    } catch {
      setError('Failed to cancel scan');
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Scanner</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Scan Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'quick' | 'full' | 'client')}
            className="w-full border rounded px-3 py-2"
            disabled={scanning}
          >
            <option value="quick">Quick (TikTok + Amazon)</option>
            <option value="full">Full (All Platforms)</option>
            <option value="client">Client Recommendations</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Search Query (optional)</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., phone accessories"
            disabled={scanning}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={startScan}
            disabled={scanning}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Start Scan'}
          </button>

          {scanning && (
            <button
              onClick={cancelScan}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Cancel Scan
            </button>
          )}
        </div>
      </div>

      {scanning && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Scanning...</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Scan Complete</h2>
          <p>Mode: {result.mode}</p>
          <p>Products Found: {result.totalProducts}</p>
          <p>Platforms: {result.platforms.join(', ')}</p>
          <p>Duration: {(result.duration / 1000).toFixed(1)}s</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Scan History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No scans yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Mode</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Products</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan) => (
                <tr key={scan.id} className="border-b">
                  <td className="py-2">{scan.mode}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        scan.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : scan.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-2">{scan.product_count || 0}</td>
                  <td className="py-2">{new Date(scan.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
