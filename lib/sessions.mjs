import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://vzrmzkecchamxbrjuxzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cm16a2VjY2hhbXhicmp1eHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMTAwODEsImV4cCI6MTk5MDU4NjA4MX0.tTyImyTfePGKcWxpMk_VR260tP3bUo6gCb9hh7tQDfQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export async function createSession(username) {
    console.log("username ", username);
    await supabase.from("sessions").delete().eq("username", username);
    const { error: insertError } = await supabase.from("sessions").insert({ username });
    if (insertError) {
        throw insertError;
    }
    const { data, error } = await supabase.from("sessions").select().eq("username", username);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return { id: null };
    }
    return data[0];
}
export async function existSession(id) {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        return false;
    }
    if (!data || data.length === 0) {
        return false;
    }
    return true;
}
export async function getSession(id) {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return null;
    }
    return data[0];
}
export async function deleteSession(id) {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
        console.error(error);
    }
    return;
}
