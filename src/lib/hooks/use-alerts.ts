import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/auth-fetch';

interface Alert {
  id: string;
  read: boolean;
  [key: string]: unknown;
}

async function fetchAlerts(): Promise<Alert[]> {
  const res = await authFetch('/api/dashboard/alerts');
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

async function markAlertRead(id: string) {
  const res = await authFetch(`/api/dashboard/alerts/${id}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to mark alert as read');
  return res.json();
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });
}

export function useUnreadCount() {
  const { data: alerts } = useAlerts();
  return alerts?.filter((a) => !a.read).length ?? 0;
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
