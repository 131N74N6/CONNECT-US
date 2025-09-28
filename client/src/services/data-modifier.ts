import type { IPostData } from "./custom-types";
import useAuth from "./useAuth";

async function deleteData(api_url: string) {
    const { user } = useAuth();
    const token = user ? user.token : null;

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
    const { user } = useAuth();
    const token = user ? user.token : null;

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

async function insertData<TSX>(props: IPostData<TSX>) {
    const { user } = useAuth();
    const token = user ? user.token : null;
    
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

export { deleteData, getData, insertData }