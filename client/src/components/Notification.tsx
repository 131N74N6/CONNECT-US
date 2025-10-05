type NotificationProps = {
    message: string;
    class_name: string;
}

function Notification(props: NotificationProps) {

    return (
        <div className="flex justify-center items-center z-20 inset-0 fixed bg-[rgba(0,0,0,0.3)]">
            <div className={props.class_name}>{props.message}</div>
        </div>
    );
}

export default Notification;