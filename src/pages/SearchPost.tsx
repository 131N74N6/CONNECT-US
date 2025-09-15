import { Navbar1, Navbar2 } from "../components/Navbar";

export default function SearchPost() {
    return (
        <div className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            <div className="bg-black flex flex-col gap-[1rem] md:w-3/4 w-full">
                <form className="bg-[#1a1a1a] p-[1rem]">
                    <input 
                        placeholder="search here..."
                        type="text" 
                        className="p-[0.45rem] font-[550] text-purple-400 outline-0 border w-full border-purple-400"
                    />
                </form>
                <div className="bg-[#1a1a1a] text-purple-400 p-[1rem] h-screen overflow-y-auto">
                    <div className="text-purple-400">No Searched Post Available</div>
                </div>
            </div>
        </div>
    );
}