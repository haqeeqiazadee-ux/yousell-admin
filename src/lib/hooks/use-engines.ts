import { useQuery } from '@tanstack/react-query';
import { authFetch } from '@/lib/auth-fetch';
import { useEngineStore } from '@/lib/stores';
import type { EngineStatus } from '@/lib/stores';

async function fetchEngineHealth(): Promise<Record<string, EngineStatus>> {
  const res = await authFetch('/api/admin/engines/health');
  if (!res.ok) throw new Error('Failed to fetch engine health');
  return res.json();
}

export function useEngineStatus() {
  const updateAll = useEngineStore((s) => s.updateAll);

  const query = useQuery({
    queryKey: ['engines', 'health'],
    queryFn: fetchEngineHealth,
    refetchInterval: 5000,
    staleTime: 2000,
    select: (data) => {
      updateAll(data);
      return data;
    },
  });

  return {
    engines: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
