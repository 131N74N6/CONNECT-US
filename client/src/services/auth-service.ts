import { useEffect, useState } from "react"
import type { SignInProps, SignUpProps, CurrentUserTokenIntrf } from "../models/user-model";

export default function useAuth() {
    const [user, setUser] = useState<CurrentUserTokenIntrf | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    const currentUserId = user ? user.user_id : '';
    const token = user ? user.token : '';

    useEffect(() => {
        function initApp() {
            try {
                const existedUser = localStorage.getItem('user');
                if (existedUser) {
                    const userData: CurrentUserTokenIntrf = JSON.parse(existedUser);
                    setUser(userData);
                }
            } catch (error: any) {
                setUser(null);
                setUserError(error.message);
                localStorage.removeItem('user');
            } finally {
                setUserLoading(false);
            }
        }

        initApp();
    }, []);

    async function signIn(props: SignInProps): Promise<void> {
        setUserLoading(true);
        setUserError(null);

        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sign-in`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: props.email.trim(), password: props.password.trim() }),
                method: 'POST'
            });

            const response = await request.json();

            if (!request.ok) {
                const errorMessage = response.error || response.message || 'Failed to sign in. Try again later';
                setUserError(errorMessage);
            } else {
                const currentUserToken: CurrentUserTokenIntrf = {
                    status: response.status,
                    token: response.token,
                    user_id: response.user_id
                };

                localStorage.setItem('user', JSON.stringify(currentUserToken));
                setUser(currentUserToken);
                props.navigate('/home');
            }
        } catch (error: any) {
            setUserError(error.message || 'Failed to sign in');
        } finally {
            setUserLoading(false);
        }
    }

    async function signUp (props: SignUpProps): Promise<void> {
        setUserLoading(true);
        setUserError(null);
        
        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sign-up`, {
                body: JSON.stringify({ 
                    created_at: props.created_at, 
                    email: props.email.trim(), 
                    password: props.password.trim(), 
                    username: props.username.trim() 
                }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST'
            });

            const response = await request.json();

            if (!request.ok) {
                const errorMessage = response.error || response.message || 'Failed to sign up. Try again later';
                setUserError(errorMessage);
            }else {
                props.navigate('/sign-in');
            }

        } catch (error: any) {
            setUserError(error.message || 'Failed to sign up' );
        } finally {
            setUserLoading(false);
        }
    }

    function signOut(navigate: (path: string) => void) {
        setUserLoading(true);
        setUserError(null);

        try {
            localStorage.removeItem('user');
            setUser(null);
            navigate('/sign-in');
        } catch (error: any) {
            setUserError(error.message || 'Failed to sign out' );
        } finally {
            setUserLoading(false);
        }
    }

    return { 
        currentUserId,
        signIn, 
        signOut, 
        signUp, 
        setUserError, 
        setUserLoading, 
        token,
        userError, 
        userLoading 
    }
}