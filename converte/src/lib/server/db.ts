import { createClient } from '@libsql/client';

export const db = createClient({
    url: 'file:./banco_local_pei.db' 
});