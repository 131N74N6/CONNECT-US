import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/useAuth";
import Loading from "../components/Loading";

export default function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    const { error, loading, user, signIn } = useAuth();
    const navigate = useNavigate();

    const handleSignIn = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        setMessage('');
        setShowMessage(false);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        try {
            if (error) throw new Error(error);
            await signIn(trimmedEmail, trimmedPassword);
        } catch (error: any) {
            setMessage(error.message);
            setShowMessage(true);
        }
    }, [email, password]);

    useEffect(() => {
        if (user && !loading) {
            navigate('/home', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showMessage]);

    if (loading) return <Loading/>

    return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
            <form onSubmit={handleSignIn} className="border bg-black border-purple-400 p-[1rem] flex flex-col gap-[1rem] w-[320px]">
                <div className="font-[650] text-[1.5rem] text-center text-purple-400">Hello</div>
                
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="email" className="text-purple-400 font-[600]">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] text-purple-400 outline-0 border border-gray-800 font-[600] rounded" 
                        placeholder="your@gmail.com"
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="password" className="font-[600] text-purple-400">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] text-purple-400 outline-0 border border-gray-800 font-[600] rounded" 
                        placeholder="your_password"
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className="text-center text-sm">
                    <span className="text-white">Don't have an account?</span> <Link className="text-blue-700 hover:underline" to={'/signup'}>Sign Up</Link>
                </div>
                
                {showMessage && (
                    <div className="text-amber-600 text-sm font-medium text-center p-2 bg-red-100 rounded">
                        {message}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={loading || !email || !password}
                    className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-purple-800 transition-colors"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}