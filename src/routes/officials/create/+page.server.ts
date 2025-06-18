import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';
import { OFFICIAL_TYPES } from '$lib/constants';

const createOfficialSchema = zfd.formData({
  name: zfd.text(),
  type: zfd.text(z.enum(OFFICIAL_TYPES)),
  department: zfd.text(),
});

export const actions: Actions = {
  createOfficial: async ({ request }) => {
    const parsed = createOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    try {
      const [official] = await db.insert(schema.officials).values(parsed.data).returning();

      throw redirect(302, `/?created=official&id=${official.id}`);
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }
      console.error('Error creating official:', error);
      return fail(500, { message: 'Functionaris aanmaken mislukt' });
    }
  },
};
