import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://vzrmzkecchamxbrjuxzl.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cm16a2VjY2hhbXhicmp1eHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMTAwODEsImV4cCI6MTk5MDU4NjA4MX0.tTyImyTfePGKcWxpMk_VR260tP3bUo6gCb9hh7tQDfQ";
export function createSupabaseClient(helper) {
    if (helper) {
        return helper(SUPABASE_URL, SUPABASE_KEY);
    }
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    return client;
}
