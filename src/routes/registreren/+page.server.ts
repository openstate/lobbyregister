import { error, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import z from 'zod/v4';
import type { Actions } from '@sveltejs/kit';

const registrationType = zfd.formData({ type: z.enum(['official', 'lobbyist']) });

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const parsed = registrationType.safeParse(formData);
    if (!parsed.success) redirect(303, '/registreren');
    if (parsed.data.type === 'official') redirect(303, '/functionarissen/registreren');
    else redirect(303, '/organisaties/registreren');
  },
};
