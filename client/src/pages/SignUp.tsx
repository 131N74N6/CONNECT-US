import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/auth.service";

export default function SignUp() {
    const { error, loading, setError, signUp, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        if (user) navigate('/home', { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const hansleSignUp = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        await signUp(new Date().toISOString(), email.trim(), username.trim(), password.trim());
    }, [email, password, username]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
            <form onSubmit={hansleSignUp} className="border border-purple-400 p-[1rem] flex flex-col gap-[1rem] bg-black w-[320px]">
                <div className="font-[650] text-[1.5rem] text-purple-400 text-center">Welcome</div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="username" className="text-purple-400">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-purple-400 text-purple-400 font-[600]" 
                        placeholder="ex: john"
                    />
                </div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="email" className="text-purple-400">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-purple-400 text-purple-400 font-[600]" 
                        placeholder="your@gmail.com"
                    />
                </div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="password" className="text-purple-400">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="p-[0.45rem] text-[0.9rem] outline-0 border border-purple-400 text-purple-400 font-[600]" 
                        placeholder="your_password"
                    />
                </div>
                <div className="text-center text-white">Already have account? <Link className="text-blue-700" to={'/signin'}>SignIn</Link></div>                    
                {error ? <div className="text-blue-300 font-medium text-[0.9rem] text-center">{error}</div> : null}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}