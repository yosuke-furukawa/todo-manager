import assert from "node:assert";
import { test } from "node:test";
import { createSession } from "./sessions.mjs";
import { createSupabaseClient } from "./client.mjs";

test("create Session", async () => {
    const helper = (url: string, key: string) => {
        const client = {
            from: (table: string) => {
                assert.equal(table, "sessions");
                return {
                    delete: () => {
                        return {
                            eq: (key: string, value: string) => {
                                assert(key, "username");
                                assert(value, "testtest")
                            }
                        };
                    },
                    insert: (obj: {username: string}) => {
                        assert.equal(obj.username, "testtest");
                        return { error: null };
                    },
                    select: () => {
                        return {
                            eq: (key: string, value: string) => {
                                assert(key, "username");
                                assert(value, "testtest")
                                return [{ data: { id: 123, username: value } }];
                            }
                        };
                    }
                };
            },
        };
        return client;
    }; 
    const supabase = createSupabaseClient(helper);
    const session = await createSession(supabase, "testtest");
    console.log(session);
    assert(session);
});