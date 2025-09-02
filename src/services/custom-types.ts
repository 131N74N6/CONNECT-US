export type DatabaseProps = {
    tableName: string;
    additionalQuery?: (query: any) => any;
    relationalQuery?: string;
    filterKey?: string;
    uniqueQueryKey?: any[];
}

export type InsertDataProps<T> = {
    tableName: string;
    newData: Omit<T, 'id' | 'created_at'>;
}

export type UpdateDataProps<T> = {
    tableName: string;
    chosenData: Partial<Omit<T, 'id' | 'created_at'>>;
    column: string;
    values: string;
}

export type UpsertDataProps<T> = {
    tableName: string;
    data: Partial<T>;
}

export type DeleteDataProps = {
    tableName: string;
    column?: string;
    values?: string;
}

export type Users = {
    email: string;
    password: string;
    username: string;
}