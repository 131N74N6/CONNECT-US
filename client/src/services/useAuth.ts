import { useEffect, useState } from 'react';
import type { User } from './custom-types';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userExist = localStorage.getItem('user');
        if (userExist) setUser(JSON.parse(userExist));
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const request = await fetch(`http://localhost:1234/users/sign-in`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                method: 'POST',
            });

            if (!request.ok) {
                const errorMsg = await request.json()
                throw new Error(errorMsg.message);
            }

            const response: User = await request.json();
            const signedInUser = {
                status: response.status,
                token: response.token,
                info: {
                    id: response.info.id,
                    email: response.info.email,
                    username: response.info.username
                }
            }

            setUser(signedInUser);
            localStorage.setItem('user', JSON.stringify(signedInUser));
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async (created_at: string, email: string, username: string, password: string) => {
        setLoading(true);
        try {
            const request = await fetch(`http://localhost:1234/users/sign-up`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_at, email, password, username }),
                method: 'POST',
            });

            if (!request.ok) {
                const errorMsg = await request.json()
                throw new Error(errorMsg.message);
            }

            if (request.ok) navigate('/signin');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const signOut = async () => {
        setLoading(true);
        try {
            localStorage.removeItem('user');
            navigate('/signin');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return { user, loading, error, signUp, signIn, signOut };
}