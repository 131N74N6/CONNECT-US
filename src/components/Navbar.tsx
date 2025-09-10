import { Link } from "react-router-dom";
import useAuth from "../services/useAuth";

export function Navbar1() {
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();
    
    return (
        <nav className="bg-[#1a1a1a] md:w-1/4 md:flex shrink-0 hidden flex-col gap-[1.25rem] p-[1rem]">
            <Link to={'/home'} className="outline-0 text-purple-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
            </Link>
            <Link to={'/about'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-address-card"></i>
                <span>About</span>
            </Link>
            <Link to={'/add-post'} className="outline-0 text-blue-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-square-plus"></i>
                <span>Add Post</span>
            </Link>
            <Link to={'/search-post'} className="outline-0 text-pink-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Search Post</span>
            </Link>
            <button type="button" className="text-amber-400 cursor-pointer text-left flex items-center gap-[0.5rem] font-[550] text-[1.2rem]" onClick={handleSignOut}>
                <i className="fa-solid fa-door-open"></i>
                <span>Sign Out</span>
            </button>
            <div className="flex-grow"></div>
            <div className="text-purple-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-user"></i>
                <span>{user?.displayName}</span>
            </div>
        </nav>
    );
}

export function Navbar2() {
    const { signOut } = useAuth();
    const handleSignOut = async () => await signOut();

    return (
        <nav className="bg-[#1a1a1a] md:hidden w-full flex shrink-0 p-[1rem]">
            <button type="button" className="text-purple-400 cursor-pointer text-left" onClick={handleSignOut}>
                <i className="fa-solid fa-door-open"></i>
                <span>Sign Out</span>
            </button>
        </nav>
    );
}