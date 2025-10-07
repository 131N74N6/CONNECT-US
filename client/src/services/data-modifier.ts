import useSWRInfinite from "swr/infinite";
import type { IPostData, IPutData } from "./custom-types";
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

    const getData = async (api_url: string) => {
        const request = await fetch(api_url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'GET'
        });

        const response = await request.json();
        return response;
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

    const infiniteScrollPagination = <TSX>(api_url: string, limit: number) => {
        const getKey = (pageIndex: number, previousPageData: TSX[]) => {
            pageIndex = pageIndex + 1;
            if (previousPageData && !previousPageData.length) return null;
            return `${api_url}?page=1&limit=${limit}`;
        }

        const { data, error, isLoading, mutate, size, setSize } =  useSWRInfinite(getKey, {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        });
        
        const getPaginatedData: TSX[] = data ? data.flat() : [];
        const isReachedEnd = data && data[data.length - 1].length < limit;
        const loadMore = data && typeof data[size - 1] === 'undefined';

        return { data, error, getPaginatedData, isLoading, isReachedEnd, loadMore, mutate, setSize, size }
    }

    return { 
        deleteData, 
        getData, 
        infiniteScrollPagination, 
        insertData, 
        updateData 
    }
}