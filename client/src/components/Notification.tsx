import { memo, useEffect } from "react";
import type { NotificationProps } from "../services/custom-types";

function Notification(props: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => props.onClose, 3000);
        return () => clearTimeout(timer);
    }, [props.onClose]);

    return (
        <div className="flex justify-center items-center inset-0 fixed bg-[rgba(0,0,0,0.3)]">
            <div className={props.className}>{props.message}</div>
        </div>
    );
}

export default memo(Notification);