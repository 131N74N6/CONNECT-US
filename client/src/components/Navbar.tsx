import { Link, useNavigate } from "react-router-dom";
import useAuth from "../services/auth-service";
import { DoorOpen, House, Info, Search, SquarePlus } from "lucide-react";

export function Navbar1() {
    const { currentUserId, signOut } = useAuth();
    const navigate = useNavigate();
    
    return (
        <nav className="bg-[#1a1a1a] md:w-1/4 md:flex shrink-0 hidden flex-col gap-[1.25rem] p-[1rem]">
            <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <House />
                <span>Home</span>
            </Link>
            <Link to={currentUserId ? `/about/${currentUserId}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <Info />
                <span>About</span>
            </Link>
            <Link to={'/add-post'} className="outline-0 text-blue-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <SquarePlus />
                <span>Add Post</span>
            </Link>
            <Link to={'/search-post'} className="outline-0 text-pink-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <Search />
                <span>Search Post</span>
            </Link>
            <button type="button" className="text-amber-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-[1.2rem]" onClick={() => signOut(navigate)}>
                <DoorOpen />
                <span>Sign Out</span>
            </button>
        </nav>
    );
}

export function Navbar2() {
    const { currentUserId, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="md:hidden flex justify-center rounded gap-[1rem] shrink-0 shadow-[0_0_4px_#1a1a1a] bg-[#1a1a1a] p-2.5">
            <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-base">
                <House />
            </Link>
            <Link to={currentUserId ? `/about/${currentUserId}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-base">
                <Info />
            </Link>
            <Link to={'/add-post'} className="outline-0 text-blue-400 flex items-center gap-[0.5rem] font-[550] text-base">
                <SquarePlus />
            </Link>
            <Link to={'/search-post'} className="outline-0 text-pink-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-base">
                <Search />
            </Link>
            <button type="button" className="text-amber-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-base" onClick={() => signOut(navigate)}>
                <DoorOpen />
            </button>
        </nav>
    );
}