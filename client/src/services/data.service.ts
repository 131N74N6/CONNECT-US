import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import AuthServices from "./auth.service";
import { useState } from "react";

type IPostData<T> = {
    api_url: string;
    data: Omit<T, '_id'>;
}

type InfiniteScrollProps = {
    api_url: string; 
    limit: number; 
    query_key: string[];
    stale_time: number;
    query_params?: boolean;
}

type IGetData = {
    api_url: string; 
    query_key: string[];
    stale_time: number;
    query_params?: boolean;
}

type IPutData<T> = {
    api_url: string;
    data: Partial<Omit<T, '_id'>>;
}

export default function DataModifier() {
    const { isUserDataLoading, currentUserId } = AuthServices();
    const [error, setError] = useState<string | null>(null);

    async function deleteData(api_url: string) {
        try {
            const request = await fetch(api_url, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });

            const response = await request.json();

            if (!request.ok) {
                throw new Error(response.message);
            } else {
                return response;
            }
        } catch (error: any) {
            throw error;
        }
    }

    async function deleteChosenData(api_url: string, data: string[]) {
        try {
            const request = await fetch(api_url, {
                body: JSON.stringify({ publicIds: data }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });

            const response = await request.json();

            if (!request.ok) {
                throw new Error(response.message);
            } else {
                return response;
            }
        } catch (error: any) {
            throw error;
        }
    }

    const getData = <TSX>(props: IGetData) => {
        const { data, error, isLoading } = useQuery<TSX, Error>({
            enabled: !!currentUserId && !isUserDataLoading && (props.query_params ?? true),
            queryFn: async () => {
                const request = await fetch(props.api_url, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
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
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
            });

            const response = await request.json();
            
            if (!request.ok) {
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            throw error;
        }
    }

    async function updateData<T>(props: IPutData<T>) {
        try {
            const request = await fetch(props.api_url, {
                body: JSON.stringify(props.data),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
            });

            const response = await request.json();

            if (!request.ok) {
                throw new Error(response.message);
            } else {
                setError(null);
                return response;
            }
        } catch (error: any) {
            throw error;
        }
    }

    const infiniteScroll = <T>(props: InfiniteScrollProps) => {
        const fetchData = async ({ pageParam = 1 }: { pageParam?: number }) => {
            const request = await fetch(`${props.api_url}?page=${pageParam}&limit=${props.limit}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
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
            enabled: !!currentUserId && !isUserDataLoading && (props.query_params ?? true),
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