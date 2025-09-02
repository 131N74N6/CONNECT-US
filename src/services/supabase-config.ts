import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_PROJECT;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

export default supabase;