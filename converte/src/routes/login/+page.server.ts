import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        if (password !== ADMIN_PASSWORD) {
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