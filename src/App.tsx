import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import AddPost from "./pages/AddPost";
import SearchPost from "./pages/SearchPost";
import About from "./pages/About";

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
                        <Route path="/add-post" element={<ProtectedRoute><AddPost/></ProtectedRoute>}/>
                        <Route path="/search-post" element={<ProtectedRoute><SearchPost/></ProtectedRoute>}/>
                        <Route path="/post/:id" element={<ProtectedRoute><PostDetail/></ProtectedRoute>}/>
                        <Route path="/" element={<Navigate to="/home" replace/>}/>
                        <Route path="*" element={<Navigate to="/signin" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </>
    )
}