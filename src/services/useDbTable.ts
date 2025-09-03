import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { DatabaseProps, DeleteDataProps, InsertDataProps, UpdateDataProps, UpsertDataProps } from "./custom-types";
import supabase from "./supabase-config";

export default function useDbTable<D extends { id: string }>() {
    const queryClient = useQueryClient();
    const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
    const isInitializeRef = useRef<boolean>(false);

    const teardownTable = useCallback(() => {
        if (realtimeChannelRef.current) {
            realtimeChannelRef.current.unsubscribe();
            realtimeChannelRef.current = null;
        }
        isInitializeRef.current = false;
    }, []);

    const transformsData = useCallback((data: any): D => {
        if (data && data.created_at && typeof data.created_at === 'string') {
            return { ...data, created_at: new Date(data.created_at) } as D;
        }
        return data as D;
    }, []);

    const fetchData = useCallback(async(props: DatabaseProps) => {
        let query = supabase.from(props.tableName).select(props.relationalQuery || '*');

        if (props.additionalQuery) query = props.additionalQuery(query);

        const { data, error } = await query;

        if (error) throw new Error('Failed to add data');

        return data.map(transformsData);
    }, [transformsData]);

    const realTimeInit = useCallback(async(props: DatabaseProps) => {
        teardownTable();
        const queryKey = [props.tableName, props.uniqueQueryKey];

        realtimeChannelRef.current = supabase.channel(`db_${props.tableName}`);
        realtimeChannelRef.current.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: props.tableName },
            async(payload: RealtimePostgresChangesPayload<D>) => {
                switch(payload.eventType) {
                    case "INSERT": {
                        let query = supabase
                        .from(props.tableName)
                        .select(props.relationalQuery || '*')
                        .eq('id', payload.new.id)
                        .single();

                        if (props.additionalQuery) query = props.additionalQuery(query);

                        const { data, error } = await query;

                        if (error) throw new Error('Failed to fetch inserted data');

                        const transformedData = transformsData(data);
                        queryClient.setQueryData<D[]>(queryKey, (oldData = []) => {
                            if (!oldData.find(item => item.id === transformedData.id)) {
                                return [...oldData, transformedData];
                            }
                            return oldData;
                        });
                        break;
                    }
                    case "UPDATE": {
                        let query = supabase
                        .from(props.tableName)
                        .select(props.relationalQuery || '*')
                        .eq('id', payload.new.id)
                        .single();

                        if (props.additionalQuery) query = props.additionalQuery(query);

                        const { data, error } = await query;

                        if (error) throw new Error('Failed to fetch inserted data');

                        const transformedData = transformsData(data);
                        queryClient.setQueryData<D[]>(queryKey, (oldData = []) => {
                            return oldData.map(item => item.id === transformedData.id ? transformedData : item)
                        });
                        break;
                    }
                    case "DELETE": {
                        const deleteData = payload.old.id;
                        queryClient.setQueryData<D[]>(queryKey, (oldData = []) => {
                            return oldData.filter(item => item.id !== deleteData)
                        });
                        break;
                    }
                }
            }
        );
        
        realtimeChannelRef.current.subscribe();
        isInitializeRef.current = true;

        const data = await fetchData(props);
        queryClient.setQueryData(queryKey, data);
    }, [queryClient, fetchData, teardownTable, transformsData]);

    function initTableData(props: DatabaseProps) {
        return useQuery({
            queryKey: [props.tableName, props.uniqueQueryKey],
            queryFn: () => fetchData(props),
            enabled: false
        });
    }

    const insertMutation = useMutation({
        mutationFn: async(props: InsertDataProps<D>) => {
            const { data, error } = await supabase
            .from(props.tableName)
            .insert([props.newData])
            .select();

            if (error) throw new Error('Failed to add data');

            return data[0];
        }
    });

    const upsertMutation = useMutation({
        mutationFn: async(props: UpsertDataProps<D>) => {
            const { data, error } = await supabase
            .from(props.tableName)
            .upsert([props.data])
            .select()
            .single();

            if (error) throw new Error('Failed to add data');

            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async(props: UpdateDataProps<D>) => {
            const { error } = await supabase
            .from(props.tableName)
            .update(props.chosenData)
            .eq(props.column, props.values);

            if (error) throw new Error('Failed to change data');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async(props: DeleteDataProps) => {
            if (props.column === undefined) return;
            if (props.column !== undefined) {
                if (Array.isArray(props.values)) {
                    const { error } = await supabase
                    .from(props.tableName)
                    .delete()
                    .in(props.column, props.values);

                    if (error) throw new Error('Failed to delete data');
                } else if (typeof props.values === 'string') {
                    const { error } = await supabase
                    .from(props.tableName)
                    .delete()
                    .eq(props.column, props.values);

                    if (error) throw new Error('Failed to delete data');
                } else {
                    const { error } = await supabase
                    .from(props.tableName)
                    .delete()
                    .not(props.column, 'is', null);

                    if (error) throw new Error('Failed to delete data');
                }
            }
        }
    });

    useEffect(() => {
        return () => teardownTable();
    }, [teardownTable]);

    return {
        insertData: insertMutation.mutateAsync,
        upsertData: upsertMutation.mutateAsync,
        updateData: updateMutation.mutateAsync,
        deleteData: deleteMutation.mutateAsync,
        realTimeInit, initTableData, teardownTable
    }
}