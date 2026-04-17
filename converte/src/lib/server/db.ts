import { createClient } from '@libsql/client';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private'; // Puxa do .env em tempo real

export const db = createClient({
    // Se não achar no .env, assume que é local do seu PC
    url: building ? 'file::memory:' : `file:${env.DATABASE_PATH ?? './banco_local_pei.db'}`
});