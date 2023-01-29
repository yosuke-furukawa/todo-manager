import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vzrmzkecchamxbrjuxzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cm16a2VjY2hhbXhicmp1eHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMTAwODEsImV4cCI6MTk5MDU4NjA4MX0.tTyImyTfePGKcWxpMk_VR260tP3bUo6gCb9hh7tQDfQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function createUser(username: string, password: string) {
    const { error } = await supabase.from("users").insert({ username, password });
    if (error) {
        throw error;
    }
}

export async function existUser(username: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.from("users").select().eq("username", username).eq("password", password); 
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return false;
    }
    return true;
}