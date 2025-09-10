import type { Session, User } from "@supabase/supabase-js";
import supabase from "./supabase-config";
import { useEffect, useState } from "react";

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function signUp(email: string, username: string, password: string) {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: `${window.location.origin}/signup`
            }
        });
        setLoading(false);
        return { data, error }
    }

    async function signIn(email: string, password: string) {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        return { data, error }
    }

    async function signOut() {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        return { error }
    }

    return { session, user, loading, signUp, signIn, signOut }
}