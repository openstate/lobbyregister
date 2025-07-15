import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server'
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import nl from "zod/v4/locales/nl.js"
z.config(nl());
import type { Actions } from '@sveltejs/kit';
import { ORGANIZATION_TYPES } from '$lib/constants';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { alias } from 'drizzle-orm/pg-core';

const createOrganizationSchema = zfd.formData({
  name: zfd.text(z.string().trim()),
  kvk_number: zfd.text(z.string().optional()),
  no_kvk: zfd.checkbox(),
  city: zfd.text(z.string().trim()),
  website: zfd.text(z.string().trim()),
  sector: zfd.text(z.string().trim()),
  type: zfd.text(z.enum(ORGANIZATION_TYPES)),
  lobbyist_name: zfd.text(z.string().trim()),
  lobbyist_function: zfd.text(z.string().trim()),
  selected_clients: z.preprocess((value) => JSON.parse(value as string), z.array(z.object({value: z.string(), label: z.string()}))),
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const parsed = createOrganizationSchema.safeParse(await request.formData());
    let formValid = parsed.success;
    let issues: string[] = [];

    let name, type, sector, kvk_number, no_kvk, city, website, is_commercial, lobbyist_name, lobbyist_function, selected_clients;
    if (!parsed.success) {
      issues = parsed.error.issues.map((issue) => `${String(issue.path[0])} - ${issue.message}`);
    } else {
      ({ name, type, sector, kvk_number, no_kvk, city, website, lobbyist_name, lobbyist_function, selected_clients } = parsed.data);
      // 03-07: decision was made to hide the is_commercial flag from the UI. Left it here so that
      // the DB did not have to be rebuilt
      is_commercial = type === 'consultant';
      website = website.replace(/^https?:?\/?\/?/, '');

      if (no_kvk) {
        kvk_number = undefined;
      } else {
        formValid = new RegExp(/^\d{8}$/).test(kvk_number || '');
        if (!formValid) {
          issues.push(`kvk_number - moet een getal van 8 cijfers zijn`)
        } else {
          // Check uniqueness KvK nummer
          const kvkNumberExists = await db
            .select({exists: sql<number>`1`})
            .from(schema.organizations)
            .where(eq(schema.organizations.kvk_number, kvk_number || ''));
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

        await db
          .insert(schema.lobbyists)
          .values({ name: lobbyist_name, function: lobbyist_function, organization_id: organization.id});

        for (let client of selected_clients) {
          await db
            .insert(schema.organization_representatives)
            .values({ representative_id: organization.id, client_id: client.value});
        }

        const message = `Lobbyorganisatie <a class='font-bold hover:underline' href='/organisaties/${organization.id}'>${organization.name}</a> is toegevoegd`;
        return redirect(302, '/', {type: 'success', message: message}, cookies);
      }
    }

    console.error('Validation error:', parsed.error);
    return fail(400, {
      message: 'Ongeldige gegevens:',
      issues: issues
    });
  },
};

export const load: PageServerLoad = async () => {
  const client_organizations = alias(schema.organizations, 'client_organizations');
  const allClientOrganizations = await db
    .select({
      client_id: client_organizations.id,
      client_name: client_organizations.name,
      client_sector: client_organizations.sector,
    })
    .from(client_organizations)
    .where(eq(client_organizations.active, true));
  const allClientOrganizationLabels = allClientOrganizations.map((organization) => {return {
    label: organization.client_name,
    value: organization.client_id,
  }});

  return {
    allClientOrganizationLabels,
  };
};