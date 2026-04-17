import { createClient } from '@libsql/client';
import { building } from '$app/environment'; // Importa o detector de build

// Se estiver "buildando", usa a memória RAM. Se estiver rodando no servidor, usa o arquivo real.
export const db = createClient({
    url: building ? 'file::memory:' : `file:${process.env.DATABASE_PATH ?? './banco_local_pei.db'}`
});