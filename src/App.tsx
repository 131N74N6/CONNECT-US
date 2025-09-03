import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import PostDetail from "./pages/PostDetail";

export default function App() {
    const initClient = new QueryClient();
    return (
        <>
            <QueryClientProvider client={initClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/signin" element={<SignIn/>}/>
                        <Route path="/signup" element={<SignUp/>}/>
                        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                        <Route path="/about" element={<ProtectedRoute><About/></ProtectedRoute>}/>
                        <Route path="/post/:id" element={<ProtectedRoute><PostDetail/></ProtectedRoute>}/>
                        <Route path="/" element={<Navigate to="/home" replace/>}/>
                        <Route path="*" element={<Navigate to="/signin" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </>
    )
}