import { useInfiniteQuery } from '@tanstack/react-query';
import useAuth from './useAuth';

export const useInfinitePagination = <T>(
  api_url: string, 
  limit: number,
  queryKey: string
) => {
  const { user } = useAuth();
  const token = user ? user.token : null;

  const fetchData = async ({ pageParam = 1 }: { pageParam?: number }) => {
    const response = await fetch(`${api_url}?page=${pageParam}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    return response.json();
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: [queryKey, api_url, limit],
    queryFn: fetchData,
    getNextPageParam: (lastPage, allPages) => {
      // Jika data terakhir kurang dari limit, berarti sudah mencapai akhir
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 5000,
  });

  const paginatedData: T[] = data?.pages.flat() ?? [];
  const isReachedEnd = !hasNextPage;
  const isLoadingMore = isFetchingNextPage;

  return {
    data: paginatedData,
    error,
    isLoading,
    isLoadingMore,
    isReachedEnd,
    fetchNextPage,
    refetch,
  };
};