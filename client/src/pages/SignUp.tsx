import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/auth.service";
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
    const { userError, userLoading, setUserError, signUp, currentUserId } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        if (currentUserId) navigate('/home', { replace: true });
    }, [currentUserId, navigate]);

    useEffect(() => {
        if (userError) {
            const timer = setTimeout(() => setUserError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [userError]);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSignUp = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        await signUp({ 
            created_at: new Date().toISOString(), email: email, 
            username: username, password: password, callback: navigate 
        });
    }, [email, password, username]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a] p-3">
            <form onSubmit={handleSignUp} className="border border-purple-400 p-[1rem] flex flex-col gap-[1rem] bg-black w-120">
                <div className="font-[650] text-[1.5rem] text-purple-400 text-center">Welcome</div>
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="username" className="text-purple-400">Username</label>
                    <input 
                        id="username" 
                        value={username}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
                        className="w-full p-3 outline-0 border border-purple-400 text-purple-400 font-medium" 
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
                        className="w-full p-3 outline-0 border border-purple-400 text-purple-400 font-medium pr-10" 
                        placeholder="your@gmail.com"
                    />
                </div>
                <div className="flex flex-col gap-[0.5rem] relative">
                    <label htmlFor="password" className="text-purple-400">Password</label>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="w-full p-3 outline-0 border border-purple-400 text-purple-400 font-medium" 
                        placeholder="your_password"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-8 cursor-pointer inset-y-0 right-0 flex items-center px-3 text-purple-200 hover:text-purple-400"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="text-center text-white">Already have account? <Link className="text-blue-400" to={'/signin'}>SignIn</Link></div>                    
                {userError ? <div className="text-blue-300 font-medium text-base md:text-md text-center">{userError}</div> : null}
                <button 
                    type="submit" 
                    disabled={userLoading}
                    className="p-[0.45rem] text-base md:text-md outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}