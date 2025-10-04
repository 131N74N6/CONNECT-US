import type { ReactNode } from "react"
import useAuth from "../services/useAuth";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: ReactNode;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return user ? <>{props.children}</> : <Navigate to={'/signin'} replace/>
}