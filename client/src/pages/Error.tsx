type ErrorProps = {
    message: string;
}

export default function Error(props: ErrorProps) {
    return (
        <div className="flex bg-black overflow-auto justify-center items-center h-screen">
            <span className="text-[2rem] font-[600] text-purple-700">{props.message}</span>
        </div>
    );
}