import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { IGetData, InfiniteScrollProps, IPostData, IPutData } from "./custom-types";
import useAuth from "./useAuth";

export default function DataModifier() {
    const { user } = useAuth();
    const token = user ? user.token : null;

    const deleteData = async (api_url: string) => {
        const request = await fetch(api_url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'DELETE'
        });

        await request.json();
    }

    const getData = <TSX>(props: IGetData) => {
        const { data, error, isLoading } = useQuery<TSX, Error>({
            queryFn: async () => {
                const request = await fetch(props.api_url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    method: 'GET'
                });
                
                const response = await request.json();
                return response;
            },
            queryKey: props.query_key,
            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            gcTime: 240000,
            staleTime: props.stale_time,
        });

        return { data, error, isLoading }
    }

    const insertData = async <TSX>(props: IPostData<TSX>) => {
        const request = await fetch(props.api_url, {
            body: JSON.stringify(props.data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'POST',
        });

        await request.json();
    }

    const updateData = async <TSX>(props: IPutData<TSX>) => {
        const request = await fetch(props.api_url, {
            body: JSON.stringify(props.data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'PUT',
        });

        await request.json();
    }

    const infiniteScroll = <T>(props: InfiniteScrollProps) => {
        const fetchData = async ({ pageParam = 1 }: { pageParam?: number }) => {
            const request = await fetch(`${props.api_url}?page=${pageParam}&limit=${props.limit}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: 'GET'
            });
            
            const response = await request.json();
            return response;
        }

        const {
            data,
            error,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            refetch,
        } = useInfiniteQuery({
            queryKey: [props.query_key],
            queryFn: fetchData,
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < props.limit) return;
                return allPages.length + 1;
            },
            initialPageParam: 1,
            staleTime: props.stale_time,
            gcTime: 240000,
            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
        });

        const paginatedData: T[] = data ? data.pages.flat() : [];
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
        }
    }

    return { deleteData, getData, infiniteScroll, insertData, updateData }
}