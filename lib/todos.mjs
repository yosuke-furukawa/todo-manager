import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
const SUPABASE_URL = "https://vzrmzkecchamxbrjuxzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cm16a2VjY2hhbXhicmp1eHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMTAwODEsImV4cCI6MTk5MDU4NjA4MX0.tTyImyTfePGKcWxpMk_VR260tP3bUo6gCb9hh7tQDfQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export async function createTodo(title, username) {
    const id = crypto.randomUUID();
    const todo = {
        id,
        title,
        username,
        done: false
    };
    const { error } = await supabase.from("todos").insert(todo);
    if (error) {
        throw error;
    }
    return todo;
}
export async function listTodos(username) {
    const { data, error } = await supabase.from("todos").select().eq("username", username).order("created_at");
    if (error) {
        throw error;
    }
    if (!data) {
        return [];
    }
    return data;
}
