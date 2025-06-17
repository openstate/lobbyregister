import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';

export const load = async () => {
  const [organizations, officials, lobbyists, representatives] = await Promise.all([
    db.select().from(schema.organizations),
    db.select().from(schema.officials),
    db.select().from(schema.lobbyists),
    db.select().from(schema.organization_representatives),
  ]);

  return { organizations, officials, lobbyists, representatives };
};

const createOrganizationSchema = zfd.formData({
  name: zfd.text(),
  type: zfd.text(z.enum(['inhouse', 'consultant', 'association'])),
  is_commercial: zfd.text(z.coerce.boolean()),
  sector: zfd.text(),
  address: zfd.text(z.string().optional()),
});

const createOfficialSchema = zfd.formData({
  name: zfd.text(),
  function: zfd.text(),
  department: zfd.text(),
});

const createLobbyistSchema = zfd.formData({
  organization_id: zfd.text(z.uuid()),
  name: zfd.text(),
  function: zfd.text(),
});

const addRepresentationSchema = zfd.formData({
  representative_id: zfd.text(z.uuid()),
  client_id: zfd.text(z.uuid()),
});

export const actions = {
  createOrganization: async ({ request }) => {
    const parsed = createOrganizationSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    try {
      const [organization] = await db.insert(schema.organizations).values(parsed.data).returning();

      return { success: true, organization };
    } catch (error) {
      console.error('Error creating organization:', error);
      return fail(500, { message: 'Organisatie aanmaken mislukt' });
    }
  },

  createOfficial: async ({ request }) => {
    const parsed = createOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    try {
      const [official] = await db.insert(schema.officials).values(parsed.data).returning();

      return { success: true, official };
    } catch (error) {
      console.error('Error creating official:', error);
      return fail(500, { message: 'Functionaris aanmaken mislukt' });
    }
  },

  createLobbyist: async ({ request }) => {
    const parsed = createLobbyistSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    try {
      const [lobbyist] = await db.insert(schema.lobbyists).values(parsed.data).returning();

      return { success: true, lobbyist };
    } catch (error) {
      console.error('Error creating lobbyist:', error);
      return fail(500, { message: 'Lobbyist aanmaken mislukt' });
    }
  },

  addRepresentation: async ({ request }) => {
    const parsed = addRepresentationSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    try {
      const [representation] = await db
        .insert(schema.organization_representatives)
        .values(parsed.data)
        .returning();

      return { success: true, representation };
    } catch (error) {
      console.error('Error adding representation:', error);
      return fail(500, { message: 'Vertegenwoordiging toevoegen mislukt' });
    }
  },
};
