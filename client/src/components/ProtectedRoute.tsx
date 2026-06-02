import type { ReactNode } from "react"
import useAuth from "../services/auth.service";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

type ProtectedRouteProps = {
    children: ReactNode;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
    const { isUserDataLoading, currentUserId } = useAuth();

    if (isUserDataLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
                <Loading/>
            </div>
        );
    }

    return currentUserId ? <>{props.children}</> : <Navigate to={'/signin'} replace/>
}