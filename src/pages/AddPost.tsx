import { Navbar1, Navbar2 } from "../components/Navbar";

export default function AddPost() {
    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen">
            <Navbar1/>
            <Navbar2/>
            <span>AddPost</span>
        </div>
    )
}