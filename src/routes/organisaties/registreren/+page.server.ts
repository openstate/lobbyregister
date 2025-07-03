import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import nl from "zod/v4/locales/nl.js"
z.config(nl());
import type { Actions } from '@sveltejs/kit';
import { ORGANIZATION_TYPES } from '$lib/constants';

const createOrganizationSchema = zfd.formData({
  name: zfd.text(z.string().trim()),
  kvk_number: zfd.text(z.coerce.number().min(10000000).max(99999999).optional()),
  sector: zfd.text(z.string().trim()),
  type: zfd.text(z.enum(ORGANIZATION_TYPES)),
});

export const actions: Actions = {
  default: async ({ request }) => {
    const parsed = createOrganizationSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      // const errorMessages = parsed.error.map()
      return fail(400, {
        message: 'Ongeldige gegevens:',
        issues: parsed.error.issues
      });
    }

    const { name, type, sector, kvk_number } = parsed.data;
    // 03-07: decision was made to hide the is_commercial flag from the UI. Left it here so that
    // the DB did not have to be rebuilt
    const is_commercial = type === 'consultant';

    const [organization] = await db
      .insert(schema.organizations)
      .values({ name, type, is_commercial, sector, kvk_number })
      .returning();

    throw redirect(302, `/?organization_id${organization.id}`);
  },
};
