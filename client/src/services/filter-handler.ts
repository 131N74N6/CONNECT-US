import { useInfiniteQuery } from "@tanstack/react-query";
import useAuth from "./auth-service";
import type { PostItemProps } from "../models/post-model";

type SearchedPost = {
    api_url: string;
    limit: number;
    query_key: string[];
    searched: string;
    stale_time: number;
}

export default function FilterHandler() {
    const { token } = useAuth();
    
    function searchedPost(props: SearchedPost) {
        const fecthers = async ({ pageParam = 1 }: { pageParam?: number }) => {
            const request = await fetch(`${props.api_url}?searched=${props.searched}&page=${pageParam}&limit=${props.limit}`, {
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
            enabled: !!props.searched,
            queryKey: props.query_key,
            queryFn: fecthers,
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

        const paginatedData: PostItemProps[] = data ? data.pages.flat() : [];
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

    return { searchedPost }
}