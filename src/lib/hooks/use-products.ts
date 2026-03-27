import { useQuery } from '@tanstack/react-query';
import { authFetch } from '@/lib/auth-fetch';

interface ProductFilters {
  [key: string]: string | undefined;
}

async function fetchProducts(filters?: ProductFilters) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value);
      }
    });
  }
  const qs = params.toString();
  const url = `/api/dashboard/products${qs ? `?${qs}` : ''}`;
  const res = await authFetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

async function fetchTrendingProducts() {
  const res = await authFetch('/api/dashboard?filter=trending');
  if (!res.ok) throw new Error('Failed to fetch trending products');
  return res.json();
}

async function fetchProductDetail(id: string) {
  const res = await authFetch(`/api/dashboard/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product detail');
  return res.json();
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 60000,
  });
}

export function useTrendingProducts() {
  return useQuery({
    queryKey: ['products', 'trending'],
    queryFn: fetchTrendingProducts,
    staleTime: 60000,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductDetail(id),
    enabled: !!id,
    staleTime: 60000,
  });
}
