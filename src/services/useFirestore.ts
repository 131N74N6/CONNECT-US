import { db } from './firebase-config';
import { useState, useEffect, useRef } from 'react';
import type { WhereFilterOp, OrderByDirection } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { 
    collection, doc, updateDoc, deleteDoc, setDoc,
    query, where, orderBy, limit, getDocs, Query,
    startAfter, QuerySnapshot
} from 'firebase/firestore';
import type { InsertDataProps, DeleteDataProps, UpdateDataProps, IGetSelectedData } from './custom-types';

// Helper function untuk membuat query config
const createQueryConfig = (
    collectionName: string,
    filters: [string, WhereFilterOp, any][] = [],
    orderByOptions: [string, OrderByDirection][] = [],
    limitOption?: number,
    startAfterDoc?: DocumentData
): Query<DocumentData> => {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    filters.forEach(([field, op, value]) => {
        q = query(q, where(field, op, value));
    });
    
    orderByOptions.forEach(([field, direction]) => {
        q = query(q, orderBy(field, direction));
    });
    
    if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
    }
    
    if (limitOption) {
        q = query(q, limit(limitOption));
    }

    return q;
};

function infiniteScroll <T extends { id: string }>(
    collectionName: string,
    filters?: [string, WhereFilterOp, any][],
    orderByOptions: [string, OrderByDirection][] = [['created_at', 'desc']],
    pageSize: number = 12
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const lastVisibleRef = useRef<DocumentData | null>(null);
    const isFetchingRef = useRef(false);

    const fetchData = async () => {
        if (isFetchingRef.current || !hasMore) return;
        
        isFetchingRef.current = true;
        setLoading(true);

        try {
            const q = createQueryConfig(
                collectionName,
                filters,
                orderByOptions,
                pageSize + 1, // Ambil satu dokumen ekstra untuk memeriksa halaman berikutnya
                lastVisibleRef.current || undefined
            );

            const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
            const docs = querySnapshot.docs;

            if (docs.length === 0) {
                setHasMore(false);
            } else {
                const newData = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() })) as T[];
                setData(prevData => [...prevData, ...newData]);
                lastVisibleRef.current = docs[docs.length - 1];
                setHasMore(docs.length > pageSize);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };
    
    useEffect(() => {
        // Reset state saat ada perubahan pada dependensi
        setData([]);
        setHasMore(true);
        lastVisibleRef.current = null;
        fetchData();
    }, [collectionName, JSON.stringify(filters), JSON.stringify(orderByOptions), pageSize]);

    return { data, loading, hasMore, fetchData };
}

function getSelectedData(props: IGetSelectedData) {
    const q = query(collection(db, props.collection_name), where(props.field_name, '==', props.values));
    return getDocs(q);
}

async function insertData<T>(props: InsertDataProps<T>) {
    const newDocRef = doc(collection(db, props.collectionName)); 
    await setDoc(newDocRef, { ...props.data, id: newDocRef.id, created_at: new Date().toISOString() });
    return newDocRef.id;
}

async function updateData<T>(props: UpdateDataProps<T>) {
    const docRef = doc(db, props.collectionName, props.values);
    await updateDoc(docRef, { ...props.newData, updated_at: new Date().toISOString() } as DocumentData);
}

async function deleteData(props: DeleteDataProps) {
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
        throw new Error('Either id or filters must be provided');
    }
}

export { deleteData, getSelectedData, infiniteScroll, insertData, updateData }