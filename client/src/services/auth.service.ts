import { useEffect, useState } from 'react';
import type { User } from './custom-types';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initAuth = () => {
            try {
                const userExist = localStorage.getItem('user');
                if (userExist) {
                    const parsedUser = JSON.parse(userExist);
                    setUser(parsedUser);
                }
            } catch (error: any) {
                setError(error.message);
                localStorage.removeItem('user'); 
            } finally {
                setLoading(false); 
            }
        };

        initAuth();
    }, []);

    async function signIn (email: string, password: string) {
        setLoading(true);
        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sign-in`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                method: 'POST',
            });

            const response = await request.json();

            if (!request.ok) {
                const errorMessage = response.error || response.message || 'Gagal sign-in! Coba lagi nanti';
                setError(errorMessage);
            } else {
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
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function signUp (created_at: string, email: string, username: string, password: string) {
        setLoading(true);
        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sign-up`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_at, email, password, username }),
                method: 'POST',
            });

            const response = await request.json();

            if (request.ok) {
                navigate('/sign-in');
            } else {
                const errorMessage = response.error || response.message || 'Gagal sign-up! Coba lagi nanti';
                setError(errorMessage);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        setLoading(true);
        try {
            localStorage.removeItem('user');
            navigate('/signin');
            setError(null);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return { user, loading, error, setError, signUp, signIn, signOut };
}