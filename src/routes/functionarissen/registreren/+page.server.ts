import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';
import { OFFICIAL_TYPES } from '$lib/constants';

const createOfficialSchema = zfd.formData({
  name: zfd.text(),
  department: zfd.text(),
  type: zfd.text(z.enum(OFFICIAL_TYPES)),
});

export const actions: Actions = {
  default: async ({ request }) => {
    const parsed = createOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return fail(400, {
        message: 'Ongeldige gegevens. Controleer of alle vereiste velden zijn ingevuld.',
      });
    }

    const { name, department, type } = parsed.data;

    const [official] = await db
      .insert(schema.officials)
      .values({ name: name.trim(), department: department.trim(), type })
      .returning();

    return redirect(302, '/');
  },
};
