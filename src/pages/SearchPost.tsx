import { Navbar1, Navbar2 } from "../components/Navbar";

export default function SearchPost() {
    return (
        <div className="flex gap-[1rem] flex-col md:flex-row h-screen">
            <Navbar1/>
            <Navbar2/>
            <div>
                <form></form>
                <div>SearchPost</div>
            </div>
        </div>
    );
}