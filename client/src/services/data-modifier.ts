import type { IPostData } from "./custom-types";
import useAuth from "./useAuth";

export default function DataModifer<TSX>() {
    const { user } = useAuth();
    const token = user ? user.token : null;

    async function deleteData(api_url: string) {
        const request = await fetch(api_url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'DELETE'
        });

        const response = await request.json();
        return response;
    }

    async function getData(api_url: string) {
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

    async function insertData(props: IPostData<TSX>) {
        const request = await fetch(props.api_url, {
            body: JSON.stringify(props.data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'POST',
        });

        const response = await request.json();
        return response;
    }

    return { deleteData, getData, insertData }
}