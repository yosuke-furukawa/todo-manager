import { SupabaseClient, createClient } from "@supabase/supabase-js";


export async function createSession(supabase: SupabaseClient, username: string): Promise<{id: string | null}> {
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
    return data[0] as { id: string };
}

export async function existSession(supabase: SupabaseClient, id: string): Promise<boolean> {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        return false;
    }
    if (!data || data.length === 0) {
        return false;
    }
    return true;
}

export async function getSession(supabase: SupabaseClient, id: string): Promise<{username: string, id: string } | null> {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return null;
    }
    return data[0];
}

export async function deleteSession(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
        console.error(error);
    }
    return;
}