import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { IGetData, InfiniteScrollProps, IPostData, IPutData } from "./custom-types";
import useAuth from "./auth.service";
import { useState } from "react";

export default function DataModifier() {
    const { loading, user } = useAuth();
    const token = user ? user.token : null;
    const [error, setError] = useState<string | null>(null);

    async function deleteData(api_url: string) {
        try {
            const request = await fetch(api_url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });

            const response = await request.json();

            if (!request.ok) {
                setError(response.message);
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Network Error');
            throw error;
        }
    }

    async function deleteChosenData(api_url: string, data: string[]) {
        try {
            const request = await fetch(api_url, {
                body: JSON.stringify({ publicIds: data }),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });

            const response = await request.json();

            if (!request.ok) {
                setError(response.message);
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Network Error');
            throw error;
        }
    }

    const getData = <TSX>(props: IGetData) => {
        const { data, error, isLoading } = useQuery<TSX, Error>({
            enabled: !!token && !loading,
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
            staleTime: props.stale_time,
        });

        return { data, error, isLoading }
    }

    async function insertData<T>(props: IPostData<T>) {
        try {
            const request = await fetch(props.api_url, {
                body: JSON.stringify(props.data),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'POST',
            });

            const response = await request.json();
            
            if (!request.ok) {
                setError(response.message);
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Check Your Network');
            throw error;
        }
    }

    async function updateData<T>(props: IPutData<T>) {
        try {
            const request = await fetch(props.api_url, {
                body: JSON.stringify(props.data),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
            });

            const response = await request.json();

            if (!request.ok) {
                setError(response.message);
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Network Error');
            throw error;
        }
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
            enabled: !!token && !loading,
            initialPageParam: 1,
            queryKey: props.query_key,
            queryFn: fetchData,
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < props.limit) return;
                return allPages.length + 1;
            },
            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            staleTime: props.stale_time,
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

    return { deleteData, deleteChosenData, error, getData, infiniteScroll, insertData, setError, updateData }
}