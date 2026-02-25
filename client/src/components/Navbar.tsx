import { Link } from "react-router-dom";
import useAuth from "../services/auth.service";
import { useState } from "react";
import { DoorOpen, House, Info, List, Search, SquarePlus, UserRound, X } from "lucide-react";

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
    const [openBar, setOpenBar] = useState<boolean>(false);
    const { user, signOut } = useAuth();
    const handleSignOut = async () => await signOut();

    return (
        <>
            <header className="bg-[#1a1a1a] md:hidden w-full flex justify-between shrink-0 p-[1rem]">
                <div className="cursor-pointer text-purple-400 font-[500] text-[1rem]" onClick={() => setOpenBar(true)}>
                    <List />
                </div>
            </header>
            {openBar ?
                <nav className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem]">
                    <button type="button" className="cursor-pointer text-purple-400 font-[500] text-[1rem] text-right" onClick={() => setOpenBar(false)}>
                        <X />
                    </button>
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
                    <div className="text-purple-400 flex items-center gap-[0.5rem] font-[550] text-[1.2rem]">
                        <UserRound />
                        <span>Hello, {user ? user.info.username : 'signed-user'}</span>
                    </div>
                </nav>
            : null}
        </>
    );
}