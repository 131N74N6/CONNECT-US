import { db } from './firebase-config';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Unsubscribe, DocumentData, FirestoreError } from "firebase/firestore";
import type { WhereFilterOp, OrderByDirection } from 'firebase/firestore';
import { 
    addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, 
    query, where, orderBy, limit, getDocs, Query, QuerySnapshot 
} from 'firebase/firestore';
import type { DatabaseProps, InsertDataProps, UpdateDataProps, DeleteDataProps, QueryOption } from './custom-types';

const createQueryConfig = (
    collectionName: string,
    filters: [string, WhereFilterOp, any][] = [],
    orderByOptions: [string, OrderByDirection][] = [],
    limitOption?: number
): Query<DocumentData, DocumentData> => {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    filters.forEach(([field, op, value]) => {
        q = query(q, where(field, op, value));
    });
    
    orderByOptions.forEach(([field, direction]) => {
        q = query(q, orderBy(field, direction));
    });
    
    if (limitOption) q = query(q, limit(limitOption));

    return q;
};

export const useFirestoreRealtime = <T extends { id: string }>(props: DatabaseProps) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<Unsubscribe | null>(null);

    const {
        collectionName,
        filters = [],
        orderBy: orderByOptions = [],
        limit: limitOption,
    } = props;

    const queryConfig = useMemo(() => 
        createQueryConfig(collectionName, filters, orderByOptions, limitOption),
        [collectionName, JSON.stringify(filters), JSON.stringify(orderByOptions), limitOption]
    );

    useEffect(() => {
        const setupListener = async () => {
            try {
                setLoading(true);
                setError(null);

                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                }

                unsubscribeRef.current = onSnapshot(
                    queryConfig,
                    (snapshot: QuerySnapshot<DocumentData>) => {
                        const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
                        setData(newData);
                        setLoading(false);
                    },
                    (err: FirestoreError) => {
                        setError(err.message);
                        setLoading(false);
                    }
                );
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        setupListener();

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        }
    }, [queryConfig]);

    return { data, loading, error };
}

export const insertData = <T>() => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: InsertDataProps<T>) => {
            const collectionRef = collection(db, props.collectionName);
            await addDoc(collectionRef, { ...props.data, created_at: new Date().toISOString() });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [variables.collectionName] 
            });
        }
    });
}

export const updateData = <T>() => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: UpdateDataProps<T>) => {
            const docRef = doc(db, props.collectionName, props.values);
            await updateDoc(docRef, { ...props.newData, updated_at: new Date().toISOString() } as DocumentData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [variables.collectionName] 
            });
        }
    });
};

export const deleteData = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (props: DeleteDataProps) => {
            if (props.values) {
                const docRef = doc(db, props.collectionName, props.values);
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
                throw new Error('Either values or filters must be provided');
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
    queryOptions?: QueryOption
) => {
    const queryKey: QueryKey = [collectionName, JSON.stringify(filters), JSON.stringify(orderByOptions), limitOption];

    return useQuery({
        queryKey,
        queryFn: async () => {
            let q: Query<DocumentData> = collection(db, collectionName);
            
            if (filters) {
                filters.forEach(([field, op, value]) => {
                    q = query(q, where(field, op, value));
                });
            }

            if (orderByOptions) {
                orderByOptions.forEach(([field, direction]) => {
                    q = query(q, orderBy(field, direction));
                });
            }
            
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