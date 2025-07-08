import { error, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import z from 'zod/v4';
import type { Actions } from '@sveltejs/kit';

const loginType = zfd.formData({ type: z.enum(['official', 'lobbyist']) });

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const parsed = loginType.safeParse(formData);
    if (!parsed.success) redirect(303, '/inloggen');
    if (parsed.data.type === 'official') redirect(303, '/inloggen_functionaris');
    else redirect(303, '/inloggen_lobbyist');
  },
};
