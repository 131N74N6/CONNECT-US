import { Navbar1, Navbar2 } from "../components/Navbar";

export default function PostDetail() {
    return (
        <div className="flex md:flex-row flex-col h-screen">
            <Navbar1/>
            <Navbar2/>
            <span>PostDetail</span>
        </div>
    )
}