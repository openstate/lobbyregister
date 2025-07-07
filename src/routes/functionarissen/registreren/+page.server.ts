import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server'
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import nl from "zod/v4/locales/nl.js"
z.config(nl());
import type { Actions } from '@sveltejs/kit';
import { OFFICIAL_TYPES } from '$lib/constants';

const createOfficialSchema = zfd.formData({
  name: zfd.text(),
  department: zfd.text(),
  type: zfd.text(z.enum(OFFICIAL_TYPES)),
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const parsed = createOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return fail(400, {
        message: 'Ongeldige gegevens:',
        issues: parsed.error.issues
      });
    }

    const { name, department, type } = parsed.data;

    const [official] = await db
      .insert(schema.officials)
      .values({ name: name.trim(), department: department.trim(), type })
      .returning();

    const message = `Overheidsfunctionaris <a class='font-medium hover:underline' href='/functionarissen/${official.id}'>${official.name}</a> is toegevoegd`;
    return redirect(302, '/', {type: 'success', message: message}, cookies);
  },
};
