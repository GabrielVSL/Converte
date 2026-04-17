import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'; // <-- MUDOU AQUI: dinâmico em vez de estático

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        // MUDOU AQUI: Agora usamos env.ADMIN_PASSWORD
        if (password !== env.ADMIN_PASSWORD) {
            return fail(400, { error: 'Senha incorreta!' });
        }

        // Criamos um cookie que dura 7 dias
        cookies.set('session', 'admin_autenticado', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 
        });

        throw redirect(303, '/');
    }
};