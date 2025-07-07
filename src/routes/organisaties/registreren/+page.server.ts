import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import nl from "zod/v4/locales/nl.js"
z.config(nl());
import type { Actions } from '@sveltejs/kit';
import { ORGANIZATION_TYPES } from '$lib/constants';
import { eq, sql } from 'drizzle-orm';

const createOrganizationSchema = zfd.formData({
  name: zfd.text(z.string().trim()),
  kvk_number: zfd.text(),
  no_kvk: zfd.checkbox(),
  city: zfd.text(z.string().trim()),
  website: zfd.text(z.string().trim()),
  sector: zfd.text(z.string().trim()),
  type: zfd.text(z.enum(ORGANIZATION_TYPES)),
});

export const actions: Actions = {
  default: async ({ request }) => {
    const parsed = createOrganizationSchema.safeParse(await request.formData());
    let formValid = parsed.success;
    let issues: string[] = [];

    let name, type, sector, kvk_number, no_kvk, city, website, is_commercial;
    if (!parsed.success) {
      issues = parsed.error.issues.map((issue) => `${String(issue.path[0])} - ${issue.message}`);
    } else {
      ({ name, type, sector, kvk_number, no_kvk, city, website } = parsed.data);
      // 03-07: decision was made to hide the is_commercial flag from the UI. Left it here so that
      // the DB did not have to be rebuilt
      is_commercial = type === 'consultant';      

      if (no_kvk) {
        kvk_number = undefined;
      } else {
        formValid = new RegExp(/^\d{8}$/).test(kvk_number);
        if (!formValid) {
          issues.push(`kvk_number - moet een getal van 8 cijfers zijn`)            
        } else {
          // Check uniqueness KvK nummer
          const kvkNumberExists = await db
            .select({exists: sql<number>`1`})
            .from(schema.organizations)
            .where(eq(schema.organizations.kvk_number, kvk_number));
          if (kvkNumberExists.length > 0) {
            issues.push(`kvk_number - er bestaat al een organisatie in het Lobbyregister met dit KvK nummber`)
            formValid = false;
          }
        }
      }

      if (formValid) {
        const [organization] = await db
          .insert(schema.organizations)
          .values({ name, type, is_commercial, sector, kvk_number, city, website })
          .returning();

        return redirect(302, `/?organization_id${organization.id}`);
      }
    }

      console.error('Validation error:', parsed.error);
      return fail(400, {
        message: 'Ongeldige gegevens:',
        issues: issues
      });
  },
};
