import { error, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import z from 'zod/v4';

const registrationType = zfd.formData({ type: z.enum(['official', 'lobbyist']) });

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const parsed = registrationType.safeParse(formData);
    if (!parsed.success) error(400, 'Invalid registration type');
    if (parsed.data.type === 'official') redirect(303, '/functionarissen/registreren');
    else redirect(303, '/organisaties/registreren');
  },
};
