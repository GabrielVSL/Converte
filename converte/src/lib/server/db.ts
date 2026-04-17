import { createClient } from '@libsql/client';

export const db = createClient({
    url: `file:${process.env.DATABASE_PATH ?? './banco_local_pei.db'}`
});