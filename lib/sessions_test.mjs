import assert from "node:assert";
import { test } from "node:test";
import { createSession } from "./sessions.mjs";
import { createSupabaseClient } from "./client.mjs";
test("create Session", async () => {
    const helper = (url, key) => {
        const client = {
            from: (table) => {
                assert.equal(table, "sessions");
                return {
                    delete: () => {
                        return {
                            eq: (key, value) => {
                                assert(key, "username");
                                assert(value, "testtest");
                            }
                        };
                    },
                    insert: (obj) => {
                        assert.equal(obj.username, "testtest");
                        return { error: null };
                    },
                    select: () => {
                        return {
                            eq: (key, value) => {
                                assert(key, "username");
                                assert(value, "testtest");
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
