import { useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth'
import {  
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from './firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase-config';

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            setError(null);
        }, (error) => {
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = useCallback(async(email: string, username: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: username });
            
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                username: username,
                createdAt: new Date()
            });
            
            return { data: user, error: null };
        } catch (error: any) {
            setError(error.message);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    }, []);

    const signIn = useCallback(async(email: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { data: userCredential.user, error: null };
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async() => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { user, loading, error, signUp, signIn, signOut };
}