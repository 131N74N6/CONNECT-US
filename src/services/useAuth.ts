import type { Session, User } from "@supabase/supabase-js";
import supabase from "./supabase-config";
import { useEffect, useState } from "react";

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function getSession(): Promise<void> {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        }

        getSession();

        const { data } = supabase.auth.onAuthStateChange(
            async(_, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => data.subscription.unsubscribe();
    }, []);

    async function signUp(email: string, username: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: `${window.location.origin}/signup`
            }
        });
        return { data, error }
    }

    async function signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error }
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        return { error }
    }

    return { session, user, loading, signUp, signIn, signOut }
}