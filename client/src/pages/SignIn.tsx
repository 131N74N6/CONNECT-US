import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/auth.service";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
    const { userError, userLoading, setUserError, currentUserId, signIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
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

    const handleSignIn = useCallback(async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        await signIn(email.trim(), password.trim());
    }, [email, password]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a] p-3">
            <form onSubmit={handleSignIn} className="border bg-black border-purple-400 p-[1rem] flex flex-col gap-[1rem] w-120">
                <div className="font-[650] text-[1.5rem] text-center text-purple-400">Hello</div>
                
                <div className="flex flex-col gap-[0.5rem]">
                    <label htmlFor="email" className="text-purple-400 font-medium">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        className="p-3 w-full text-purple-400 outline-0 border border-purple-400 font-medium rounded" 
                        placeholder="your@gmail.com"
                    />
                </div>
                
                <div className="flex flex-col gap-[0.5rem] relative">
                    <label htmlFor="password" className="font-medium text-purple-400">Password</label>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        value={password}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        className="w-full p-3 text-purple-400 outline-0 border border-purple-400 font-medium rounded pr-10" 
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
                
                <div className="text-center text-sm">
                    <span className="text-white">Don't have an account?</span> <Link className="text-blue-400 hover:underline" to={'/signup'}>Sign Up</Link>
                </div>
                
                {userError ? <div className="text-blue-300 font-medium text-center text-base md:text-md">{userError}</div> : null}
                
                <button 
                    type="submit" 
                    disabled={userLoading}
                    className="p-[0.45rem] text-base md:text-md outline-0 border-0 bg-purple-700 text-white font-[550] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-purple-800 transition-colors"
                >
                    {userLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}