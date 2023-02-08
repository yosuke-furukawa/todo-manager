export async function createSession(supabase, username) {
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
export async function existSession(supabase, id) {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        return false;
    }
    if (!data || data.length === 0) {
        return false;
    }
    return true;
}
export async function getSession(supabase, id) {
    const { data, error } = await supabase.from("sessions").select().eq("id", id);
    if (error) {
        throw error;
    }
    if (!data || data.length === 0) {
        return null;
    }
    return data[0];
}
export async function deleteSession(supabase, id) {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
        console.error(error);
    }
    return;
}
