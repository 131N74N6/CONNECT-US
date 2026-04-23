import { useEffect, useState } from 'react';
import type { User } from './custom-types';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    const currentUserId = user ? user.user_id : null;
    const token = user ? user.token : null;
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
                setUserError(null);
                setUserError(error.message);
                localStorage.removeItem('user'); 
            } finally {
                setUserLoading(false); 
            }
        };

        initAuth();
    }, []);

    async function signIn (email: string, password: string) {
        setUserLoading(true);
        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sign-in`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                method: 'POST',
            });

            const response = await request.json();

            if (!request.ok) {
                const errorMessage = response.error || response.message || 'Gagal sign-in! Coba lagi nanti';
                setUserError(errorMessage);
            } else {
                const signedInUser = {
                    status: response.status,
                    token: response.token,
                    user_id: response.user_id
                }
    
                setUser(signedInUser);
                localStorage.setItem('user', JSON.stringify(signedInUser));
            }
        } catch (error: any) {
            setUserError(error.message);
        } finally {
            setUserLoading(false);
        }
    }

    async function signUp (created_at: string, email: string, username: string, password: string) {
        setUserLoading(true);
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
                setUserError(errorMessage);
            }
        } catch (error: any) {
            setUserError(error.message);
        } finally {
            setUserLoading(false);
        }
    }

     function signOut() {
        setUserLoading(true);
        try {
            localStorage.removeItem('user');
            navigate('/signin');
            setUserError(null);
        } catch (error: any) {
            setUserError(error.message);
        } finally {
            setUserLoading(false);
        }
    }

    return { currentUserId, token, userLoading, userError, setUserError, signUp, signIn, signOut };
}