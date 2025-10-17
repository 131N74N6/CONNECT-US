import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import AddPost from "./pages/AddPost";
import SearchPost from "./pages/SearchPost";
import About from "./pages/About";
import Setting from "./pages/Setting";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LikeList from "./pages/LikeList";
import Followers from "./pages/Followers";

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                    <Route path="/about/:user_id" element={<ProtectedRoute><About/></ProtectedRoute>}/>
                    <Route path="/setting/:user_id" element={<ProtectedRoute><Setting/></ProtectedRoute>}/>
                    <Route path="/add-post" element={<ProtectedRoute><AddPost/></ProtectedRoute>}/>
                    <Route path="/search-post" element={<ProtectedRoute><SearchPost/></ProtectedRoute>}/>
                    <Route path="/post/:_id" element={<ProtectedRoute><PostDetail/></ProtectedRoute>}/>
                    <Route path="/like-post/:_id" element={<ProtectedRoute><LikeList/></ProtectedRoute>}/>
                    <Route path="/followers/:user_id" element={<ProtectedRoute><Followers/></ProtectedRoute>}/>
                    <Route path="/" element={<Navigate to="/home" replace/>}/>
                    <Route path="*" element={<Navigate to="/signin" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}