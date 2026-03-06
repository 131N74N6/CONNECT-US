import { Link } from "react-router-dom";
import useAuth from "../services/auth.service";
import { DoorOpen, House, Info, Search, SquarePlus, UserRound } from "lucide-react";

export function Navbar1() {
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();
    
    return (
        <nav className="bg-[#1a1a1a] md:w-1/4 md:flex shrink-0 hidden flex-col gap-[1.25rem] p-[1rem]">
            <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <House />
                <span>Home</span>
            </Link>
            <Link to={user ? `/about/${user.info.id}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
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
            <button type="button" className="text-amber-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-[1.2rem]" onClick={handleSignOut}>
                <DoorOpen />
                <span>Sign Out</span>
            </button>
            <div className="flex-grow"></div>
            <div className="text-purple-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <UserRound />
                <span>{user ? user.info.username : 'signed-user'}</span>
            </div>
        </nav>
    );
}

export function Navbar2() {
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();

    return (
        <nav className="md:hidden flex justify-center rounded gap-[1rem] shrink-0 shadow-[0_0_4px_#1a1a1a] bg-[#1a1a1a] p-2.5">
            <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-base">
                <House />
            </Link>
            <Link to={user ? `/about/${user.info.id}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-base">
                <Info />
            </Link>
            <Link to={'/add-post'} className="outline-0 text-blue-400 flex items-center gap-[0.5rem] font-[550] text-base">
                <SquarePlus />
            </Link>
            <Link to={'/search-post'} className="outline-0 text-pink-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-base">
                <Search />
            </Link>
            <button type="button" className="text-amber-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-base" onClick={handleSignOut}>
                <DoorOpen />
            </button>
            <div className="text-purple-400 flex items-center gap-[0.5rem] font-[550] text-base">
                <UserRound />
            </div>
        </nav>
    );
}