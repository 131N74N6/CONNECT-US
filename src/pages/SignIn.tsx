import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import useAuth from "../services/useAuth";
import useSupabaseTable from "../services/useSupabaseTable";
import type { Users } from "../services/custom-types";
import supabase from "../services/supabase-config";

export default function SignIn() {
    const { signIn, user } = useAuth();
    const { upsertData } = useSupabaseTable<Users>();
    const navigate = useNavigate();
    const galleryUserTable = 'image_gallery_user';

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    useEffect(() => {
        if (user) navigate('/home', { replace: true });
    }, [user, navigate]);

    async function handleSignIn(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        try {
            if (trimmedEmail === '' || trimmedPassword === '') throw new Error('Missing required data');

            const { error } = await signIn(trimmedEmail, trimmedPassword);

            if (error) throw new Error('Failed to signin. Try again later');

            if (user) {
                const { data, error } = await supabase
                .from(galleryUserTable)
                .select('*')
                .eq('id', user.id)
                .single();

                if (error && error.code === 'PGRST116') throw error.message;

                if (!data) {
                    const username = user.user_metadata?.username || 'new user';
                    await upsertData({
                        tableName: galleryUserTable,
                        data: {
                            username: username,
                            email: trimmedEmail,
                            password: trimmedPassword
                        }
                    });
                }
            }
            navigate('/home', { replace: true });
        } catch (error: any) {
            setMessage(error.message);
            setShowMessage(true);
        }
    }

    return (
        <>
            {showMessage ? 
                <Notification 
                    className='bg-white p-[0.5rem] border border-black font-[550]'
                    message={message} 
                    onClose={() => setShowMessage(false)}
                /> 
            : null}
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
                    <button 
                        type="submit" 
                        className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </>
    );
}