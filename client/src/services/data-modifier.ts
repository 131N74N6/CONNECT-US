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

    return { deleteData, getData, insertData, updateData }
}