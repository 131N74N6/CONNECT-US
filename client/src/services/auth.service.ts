import { useState } from "react"
import type { SignInProps, SignUpProps, CurrentUserIntrf } from "../models/user_model";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AuthServices() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [authError, setAuthError] = useState<string | null>(null);

    const { data: userData, isLoading: isUserDataLoading, error: userDataError } = useQuery<CurrentUserIntrf | null>({
        queryKey: ['current-user'],
        queryFn: async () => {
            try {
                const request = await fetch('${import.meta.env.VITE_API_BASE_URL}/users/profile', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'GET'
                });
                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return await request.json();
            } catch (error) {
                throw error;
            }
        },
        retry: false,
        staleTime: Infinity,
    });

    const currentUserId = userData ? userData.user_id : '';
    const currentUsername = userData ? userData.username : '';

    const signIn = useMutation({
        mutationFn: async (props: SignInProps) => {
            try {
                const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-in`, {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: props.email.trim(), password: props.password.trim() }),
                    method: 'POST'
                });

                const response = await request.json();

                if (!request.ok) {
                    const errorMessage = response.error || response.message || 'Failed to sign in. Try again later';
                    throw new Error(errorMessage);
                } else {
                    return response;
                }
            } catch (error: any) {
                throw error;
            }
        },
        onError: (error) => {
            setAuthError(error.message || 'Failed to sign in');
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['current-user'] });
            navigate('/home');
        }
    });

    async function signUp (props: SignUpProps): Promise<void> {
        try {
            const request = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`, {
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
                const errorMessage = response.message || 'Failed to sign up. Try again later';
                throw new Error(errorMessage);
            } else {
                navigate('/signin');
            }
        } catch (error: any) {
            setAuthError(error.message || 'Failed to sign up' );
        }
    }

    async function signOut() {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-out`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST'
            });
        } catch (error) {
            // Even if the sign-out request fails, we still want to clear the user data and navigate to the sign-in page
        } finally {
            queryClient.setQueryData(['current-user'], null);
            queryClient.clear();
            navigate('/sign-in');
        }
    }

    return { 
        authError, 
        currentUserId,
        currentUsername,
        isSigningIn: signIn.isPending,
        isUserDataLoading, 
        signIn, 
        signOut, 
        signUp, 
        setAuthError, 
        userData,
        userDataError,
    }
}