import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../services/supabase-config";
import useAuth from "../services/useAuth";
import useDbTable from "../services/useDbTable";
import type { Users } from "../services/custom-types";

export default function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    const noteUserTable = 'image_gallery_user';
    const { user, signIn } = useAuth();
    const navigate = useNavigate();
    const { upsertData } = useDbTable<Users>();

    useEffect(() => {
        if (user) navigate('/home', { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return clearTimeout(timer);
        }
    }, [showMessage]);

    async function handleSignIn(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        try {
            const { error } = await signIn(trimmedEmail, trimmedPassword);

            if (error) throw new Error('Failed to signin. Try again later');

            if (user) {
                const { data: profile, error: errorGetProfile } = await supabase
                .from(noteUserTable)
                .select('*')
                .eq('id', user.id)
                .single();

                if (errorGetProfile && errorGetProfile.code === 'PGRST116') throw errorGetProfile;

                if (!profile) {
                    const username = user.user_metadata?.username || 'New User';

                    await upsertData({
                        tableName: noteUserTable,
                        data: {
                            id: user.id,
                            email: user.email,
                            password: trimmedPassword,
                            username: username
                        }
                    });
                }
            }
            navigate('/home', { replace: true });
        } catch (error: any) {
            setMessage(error.message);
            setShowMessage(true);
        } finally {
            setEmail('');
            setPassword('');
            setLoading(false);
        }
    }
    
    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSignIn} className="border border-gray-400 p-[1rem] flex flex-col gap-[1rem] w-[320px]">
                <div className="font-[650] text-[1.5rem] text-center">Hello</div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-gray-800 font-[600]" 
                        placeholder="your@gmail.com"
                    />
                </div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-gray-800 font-[600]" 
                        placeholder="your_password"
                    />
                </div>
                <div className="text-center">Don't have account? <Link className="text-blue-700" to={'/signup'}>SignUp</Link></div>
                {showMessage ? 
                    <div className="text-red-600 text-sm font-medium text-center">
                        {message}
                    </div>
                : null}
                <button 
                    type="submit" 
                    disabled={loading || (email === '' || password === '')}
                    className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}