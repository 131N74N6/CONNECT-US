import { useState, useEffect, useRef, useMemo } from 'react';
import type { QueryKey, QueryOptions } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Unsubscribe, DocumentData, FirestoreError } from "firebase/firestore";
import type { WhereFilterOp, OrderByDirection } from 'firebase/firestore';
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
    limit, 
    getDocs,
    Query,
    QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase-config';
import type { DatabaseProps, InsertDataProps, UpdateDataProps, DeleteDataProps } from './custom-types';

export const useShowDocument = <T extends { id: string }>(props: DatabaseProps) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<Unsubscribe | null>(null);
const isMountedRef = useRef(true);

    const {
        collectionName,
        filters = [],
        orderBy: orderByOptions = [],
        limit: limitOption
    } = props;

    const queryConfig = useMemo(() => {
        let q: Query<DocumentData> = collection(db, collectionName);
        
        filters.forEach(([field, op, value]) => {
            q = query(q, where(field, op, value));
        });
        
        orderByOptions.forEach(([field, direction]) => {
            q = query(q, orderBy(field, direction));
        });
        
        if (limitOption) q = query(q, limit(limitOption));

        return q;
    }, [collectionName, filters, orderByOptions, limitOption]);

    useEffect(() => {
        isMountedRef.current = true;
        
        const setupListener = async () => {
            try {
                setLoading(true);
                setError(null);

                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                }

                unsubscribeRef.current = onSnapshot(
                    queryConfig,
                    (snapshot: QuerySnapshot<DocumentData>) => {
                        if (!isMountedRef.current) return;
                        
                        const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
                        
                        setData(newData);
                        setLoading(false);
                    },
                    (err: FirestoreError) => {
                        if (!isMountedRef.current) return;
                        setError(err.message);
                        setLoading(false);
                    }
                );
            } catch (err: any) {
                if (!isMountedRef.current) return;
                setError(err.message);
                setLoading(false);
            }
        };

        setupListener();

        return () => {
            isMountedRef.current = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [queryConfig]);

    return { data, loading, error };
}

export const useAddDocument = <T,>() => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: InsertDataProps<T>) => {
            const docRef = await addDoc(
                collection(db, props.collectionName), 
                { ...props.data, created_at: new Date().toISOString() }
            );
            return { id: docRef.id, ...props.data };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [variables.collectionName] 
            });
        }
    });
}

export const useUpdateDocument = <T,>() => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: UpdateDataProps<T>) => {
            const docRef = doc(db, props.collectionName, props.docId);
            await updateDoc(docRef, { 
                ...props.newData, 
                updated_at: new Date().toISOString() 
            } as DocumentData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [variables.collectionName] 
            });
        }
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: DeleteDataProps) => {
            if (props.docId) {
                const docRef = doc(db, props.collectionName, props.docId);
                await deleteDoc(docRef);
            } else if (props.filters) {
                let q: Query<DocumentData> = collection(db, props.collectionName);
                
                props.filters.forEach(([field, op, value]) => {
                    q = query(q, where(field, op, value));
                });
                
                const querySnapshot = await getDocs(q);
                const deletePromises = querySnapshot.docs.map(doc => 
                    deleteDoc(doc.ref)
                );
                
                await Promise.all(deletePromises);
            } else {
                throw new Error('Either docId or filters must be provided');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [variables.collectionName] 
            });
        }
    });
}

export const useFirestoreQueryTanstack = <T extends { id: string }>(
    collectionName: string,
    filters?: [string, WhereFilterOp, any][],
    orderByOptions?: [string, OrderByDirection][],
    limitOption?: number,
    queryOptions?: QueryOptions
) => {
    const queryKey: QueryKey = [collectionName, filters, orderByOptions, limitOption];

    return useQuery({
        queryKey,
        queryFn: async () => {
            let q: Query<DocumentData> = collection(db, collectionName);
            
            // Apply filters
            if (filters) {
                filters.forEach(([field, op, value]) => {
                    q = query(q, where(field, op, value));
                });
            }
            
            // Apply ordering
            if (orderByOptions) {
                orderByOptions.forEach(([field, direction]) => {
                    q = query(q, orderBy(field, direction));
                });
            }
            
            // Apply limit
            if (limitOption) {
                q = query(q, limit(limitOption));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            })) as T[];
        },
        ...queryOptions
    });
}

export default {
    useShowDocument,
    useAddDocument,
    useUpdateDocument,
    useDeleteDocument,
    useFirestoreQueryTanstack
};