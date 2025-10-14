import { Link } from "react-router-dom";
import useAuth from "../services/useAuth";
import { useState } from "react";

export function Navbar1() {
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();
    
    return (
        <nav className="bg-[#1a1a1a] md:w-1/4 md:flex shrink-0 hidden flex-col gap-[1.25rem] p-[1rem]">
            <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
            </Link>
            <Link to={user ? `/about/${user.info.id}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
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
                <span>{user ? user.info.username : 'signed-user'}</span>
            </div>
        </nav>
    );
}

export function Navbar2() {
    const [openBar, setOpenBar] = useState<boolean>(false);
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();

    return (
        <>
            <header className="bg-[#1a1a1a] md:hidden w-full flex justify-between shrink-0 p-[1rem]">
                <div className="cursor-pointer text-purple-400 font-[500] text-[1rem]" onClick={() => setOpenBar(true)}>
                    <i className="fa-solid fa-bars"></i>
                </div>
            </header>
            {openBar ?
                <nav className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem]">
                    <button type="button" className="text-purple-400 font-[500] text-[1rem] text-right" onClick={() => setOpenBar(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <Link to={'/home'} className="outline-0 text-white flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                        <i className="fa-solid fa-house"></i>
                        <span>Home</span>
                    </Link>
                    <Link to={user ? `/about/${user.info.id}` : '/home'} className="outline-0 text-orange-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
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
                    <div className="text-purple-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                        <i className="fa-solid fa-user"></i>
                        <span>Hello, {user ? user.info.username : 'signed-user'}</span>
                    </div>
                </nav>
            : null}
        </>
    );
}