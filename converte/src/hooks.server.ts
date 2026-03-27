import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');
    const isLoginPage = event.url.pathname === '/login';
    const isApiPage = event.url.pathname.startsWith('/api');

    // Se não estiver logado e não for a página de login ou a API do Make
    if (!session && !isLoginPage && !isApiPage) {
        throw redirect(303, '/login');
    }

    return await resolve(event);
};