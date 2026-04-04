import { createClient } from '@libsql/client';

export const db = createClient({
    url: `file:${process.env.DATABASE_PATH ?? './data/banco_local_pei.db'}`
});