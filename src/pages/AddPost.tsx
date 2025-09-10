import { Navbar1, Navbar2 } from "../components/Navbar";

export default function AddPost() {
    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen">
            <Navbar1/>
            <Navbar2/>
            <section id="notification_"></section>
        <form id="image-upload-field" title="image-upload-field" class="flex gap-[1.3rem] w-[320px] p-[1rem] rounded-[1rem] flex-col shadow-[0_0_6px_rgba(0,0,0,0.3)]">
            <input type="file" id="media-file" class="hidden" multiple accept=".jpg,.png,.jpeg" placeholder="select-your-file"/>
            <section id="image-preview-container" class="border-dashed border-[1px] h-[250px] p-[0.5rem] cursor-pointer border-[rgba(0,0,0,0.3)]">No Images Selected</section>
            <input type="text" id="image-title" placeholder="enter-image-title..." class="p-[0.45rem] border-[1px] outline-0 border-[rgba(0,0,0,0.3)] text-[0.9rem] font-[550]"/>
            <button type="submit" id="add-post-button" class="text-[0.9rem] p-[0.45rem] rounded-[0.45rem] font-[550] cursor-pointer bg-[#765898] text-[#FFFFFF]">Add Post</button>
        </form>
        </div>
    )
}