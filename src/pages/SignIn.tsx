import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/useAuth";
import useDbTable from "../services/useDbTable";
import type { Users } from "../services/custom-types";
import supabase from "../services/supabase-config";

export default function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    const noteUserTable = 'image_gallery_user';
    const { user, signIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { upsertData } = useDbTable<Users>();

    const checkUserExists = useCallback(async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from(noteUserTable)
                .select('id')
                .eq('id', userId)
                .single();
                
            return !error && data !== null;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }, [noteUserTable]);

    const handleSignIn = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        setMessage('');
        setShowMessage(false);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        try {
            if (!trimmedEmail || !trimmedPassword) {
                throw new Error('Email and password are required');
            }

            const { data: authData, error: signInError } = await signIn(trimmedEmail, trimmedPassword);

            if (signInError) {
                throw new Error(signInError.message || 'Failed to sign in. Please try again.');
            }

            if (!authData?.user) {
                throw new Error('No user data returned from sign in');
            }

            checkUserExists(authData.user.id).then(userExists => {
                if (!userExists) {
                    upsertData({
                        tableName: noteUserTable,
                        data: {
                            id: authData.user.id,
                            email: authData.user.email,
                            username: authData.user.user_metadata?.username || 'New User',
                            password: password.trim()
                        }
                    }).catch(console.error);
                }
            });
        } catch (error: any) {
            setMessage(error.message);
            setShowMessage(true);
        }
    }, [email, password, signIn, checkUserExists, upsertData]);

    useEffect(() => {
        if (user && !authLoading) {
            navigate('/home', { replace: true });
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSignIn} className="border border-gray-400 p-[1rem] flex flex-col gap-[1rem] w-[320px]">
                <div className="font-[650] text-[1.5rem] text-center">Hello</div>
                
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="email" className="font-[600]">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-gray-800 font-[600] rounded" 
                        placeholder="your@gmail.com"
                        required
                        disabled={authLoading}
                    />
                </div>
                
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="password" className="font-[600]">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-gray-800 font-[600] rounded" 
                        placeholder="your_password"
                        required
                        disabled={authLoading}
                    />
                </div>
                
                <div className="text-center text-sm">
                    Don't have an account? <Link className="text-blue-700 hover:underline" to={'/signup'}>Sign Up</Link>
                </div>
                
                {showMessage && (
                    <div className="text-red-600 text-sm font-medium text-center p-2 bg-red-100 rounded">
                        {message}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={authLoading || !email || !password}
                    className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-purple-800 transition-colors"
                >
                    {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}