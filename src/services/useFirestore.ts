import { db } from './firebase-config';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { WhereFilterOp, OrderByDirection, FirestoreError, DocumentSnapshot } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { 
    collection, doc, updateDoc, deleteDoc, setDoc,
    query, where, orderBy, limit, getDocs, Query,
    startAfter, QuerySnapshot,
    onSnapshot
} from 'firebase/firestore';
import type { 
    InsertDataProps, DeleteDataProps, UpdateDataProps, IGetSelectedData, IRealTime, IInfiniteScroll 
} from './custom-types';

// Helper function untuk membuat query config
function createQueryConfig(
    collectionName: string,
    filters: [string, WhereFilterOp, any][] = [],
    orderByOptions: [string, OrderByDirection][] = [],
    limitOption?: number,
    startAfterDoc?: DocumentData
): Query<DocumentData> {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    filters.forEach(([field, op, value]) => q = query(q, where(field, op, value)));
    
    orderByOptions.forEach(([field, direction]) => q = query(q, orderBy(field, direction)));
    
    if (startAfterDoc) q = query(q, startAfter(startAfterDoc));
    
    if (limitOption) q = query(q, limit(limitOption));

    return q;
};

function infiniteScroll <Q extends { id: string }>(props: IInfiniteScroll) {
    const [data, setData] = useState<Q[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const lastVisibleRef = useRef<DocumentData | null>(null);
    const isFetchingRef = useRef<boolean>(false);
    const propsRef = useRef<IInfiniteScroll>(props);

    propsRef.current = props;

    const fetchData = useCallback(async (): Promise<void> => {
        if (isFetchingRef.current || !hasMore) return;
        
        isFetchingRef.current = true;
        setLoading(true);

        try {
            const q = createQueryConfig(
                propsRef.current.collection_name,
                propsRef.current.filters || [],
                propsRef.current.order_by_options,
                propsRef.current.page_size + 1,
                lastVisibleRef.current || undefined
            );

            const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
            const docs = querySnapshot.docs;

            if (docs.length === 0) {
                setHasMore(false);
            } else {
                const newData = docs.slice(0, propsRef.current.page_size).map(doc => ({ 
                    id: doc.id, ...doc.data() 
                })) as Q[];
                
                setData(prevData => {
                    // Hindari duplikasi data
                    const uniqueData = [...prevData, ...newData].reduce((acc, current) => {
                        if (!acc.find(item => item.id === current.id)) acc.push(current);
                        return acc;
                    }, [] as Q[]);
                    
                    return uniqueData;
                });
                
                lastVisibleRef.current = docs[docs.length - 1];
                setHasMore(docs.length > propsRef.current.page_size);
            }
        } catch (error: any) {
            console.error("Failed to fetch data:", error);
            setError("Failed to fetch data: " + error.message);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [hasMore]);

    useEffect(() => {
        // Reset state ketika filters atau parameter query berubah
        setData([]);
        setHasMore(true);
        lastVisibleRef.current = null;
        isFetchingRef.current = false;
        
        // Hanya fetch data jika filters tidak undefined
        if (props.filters !== undefined) fetchData();
    }, [props.collection_name, JSON.stringify(props.filters), JSON.stringify(props.order_by_options), props.page_size]);

    return { data, loading, error, hasMore, fetchData };
}

function getSelectedData<I>(props: IGetSelectedData) {
    const [data, setData] = useState<I | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!props.values) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, props.collection_name, props.values);

        const unsubscribe = onSnapshot(docRef, 
            (docSnap: DocumentSnapshot<DocumentData, DocumentData>) => {
                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() } as I);
                    setError(null);
                } else {
                    setData(null);
                    setError('404 | Data not found');
                }
                setLoading(false);
            }, (err: FirestoreError) => {
                setData(null);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [props.collection_name, props.values]);

    return { data, loading, error };
}

function realTimeInit<K>(props: IRealTime) {
    const [data, setData] = useState<K[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { collection_name, order_by_options = [], filters = [] } = props;

    useEffect(() => {
        setLoading(true);
        
        let q: Query<DocumentData> = collection(db, collection_name);
        
        filters.forEach(([field, op, value]) => q = query(q, where(field, op, value)));
        
        order_by_options.forEach(([field, direction]) => q = query(q, orderBy(field, direction)));

        const unsubscribe = onSnapshot(q,
            (snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
                const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as K[];
                setData(newData);
                setLoading(false);
            },
            (err: FirestoreError) => {
                setData([]);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collection_name, JSON.stringify(filters), JSON.stringify(order_by_options)]);
    
    return { data, loading, error };
}

async function insertData<H>(props: InsertDataProps<H>): Promise<string> {
    const newDocRef = doc(collection(db, props.collectionName)); 
    await setDoc(newDocRef, { ...props.data, id: newDocRef.id, created_at: new Date().toISOString() });
    return newDocRef.id;
}

async function updateData<C>(props: UpdateDataProps<C>): Promise<void> {
    const docRef = doc(db, props.collectionName, props.values);
    await updateDoc(docRef, { ...props.newData, updated_at: new Date().toISOString() } as DocumentData);
}

async function deleteData(props: DeleteDataProps): Promise<void> {
    if (props.values) {
        const docRef = doc(db, props.collectionName, props.values);
        await deleteDoc(docRef);
    } else if (props.filters) {
        let q: Query<DocumentData> = collection(db, props.collectionName);
        
        props.filters.forEach(([field, op, value]) => q = query(q, where(field, op, value)));
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        
        await Promise.all(deletePromises);
    } else {
        throw new Error('Either id or filters must be provided');
    }
}

export { deleteData, getSelectedData, infiniteScroll, insertData, realTimeInit, updateData }