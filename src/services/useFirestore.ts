import { useState, useEffect, useCallback } from 'react';
import type { 
    DocumentData, 
    FirestoreError, 
    QueryDocumentSnapshot, 
    QuerySnapshot, 
    Unsubscribe 
} from 'firebase/firestore';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    query,
    where,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { db } from './firebase-config';

export default function useFirestore<T>() {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

    useEffect(() => {
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [unsubscribe]);

    const getDocument = useCallback(async(collectionName: string, id: string) => {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            } else {
                setError("Document not found");
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, []);

    const getCollection = useCallback((collectionName: string, conditions: any[] = [], order: any[] = []) => {
        setLoading(true);
        try {
            let q = query(collection(db, collectionName));
            
            // Apply conditions
            conditions.forEach(condition => {
                q = query(q, where(condition.field, condition.operator, condition.value));
            });
            
            // Apply ordering
            order.forEach(ord => {
                q = query(q, orderBy(ord.field, ord.direction || 'asc'));
            });
            
            // Set up real-time listener
            const unsub = onSnapshot(q, 
                (querySnapshot: QuerySnapshot<DocumentData, DocumentData>) => {
                    const items: T[] = [];
                    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
                        items.push({ id: doc.id, ...doc.data() } as T);
                    });
                    setData(items);
                    setLoading(false);
                },
                (err: FirestoreError) => {
                    setError(err.message);
                    setLoading(false);
                }
            );
            
            setUnsubscribe(() => unsub);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }, []);

    const addDocument = useCallback(async(collectionName: string, newData: Omit<T, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, collectionName), newData);
            return { id: docRef.id, error: null };
        } catch (err: any) {
            return { id: null, error: err.message };
        }
    }, []);

    const updateDocument = useCallback(async(collectionName: string, id: string, updatedData: Partial<T>) => {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, updatedData as any);
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    }, []);

    const deleteDocument = useCallback(async(collectionName: string, id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    }, []);

    return {
        data,
        loading,
        error,
        getDocument,
        getCollection,
        addDocument,
        updateDocument,
        deleteDocument
    }
}