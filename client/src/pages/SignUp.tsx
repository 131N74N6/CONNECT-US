import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/useAuth";
import Loading from "../components/Loading";

export default function SignUp() {
    const { error, loading, signUp, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showMessage, setShowMessage] = useState<boolean>(false);

    useEffect(() => {
        if (user) navigate('/home', { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        if (showMessage) {
            const timer = setTimeout(() => setShowMessage(false), 3000);
            return clearTimeout(timer);
        }
    }, [showMessage]);

    const hansleSignUp = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        const getCurrentDate = new Date();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedUserName = username.trim();

        try {
            if (error) throw new Error(error);
            await signUp(getCurrentDate.toISOString(), trimmedEmail, trimmedUserName, trimmedPassword);
        } catch (error: any) {
            setMessage(error.message);
            setShowMessage(true);
        } finally {
            setUsername('');
            setEmail('');
            setPassword('');
        }
    }, [email, password, username]);
    
    if (loading) return <Loading/>

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
                {showMessage ? 
                    <div className="text-red-400 text-sm font-medium text-center p-2 bg-red-100 rounded">
                        {message}
                    </div>
                : null}
                <button 
                    type="submit" 
                    disabled={loading || email === '' || username === '' || password === ''}
                    className="p-[0.45rem] text-[0.9rem] outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}