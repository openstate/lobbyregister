import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';

export const load = async () => {
  const organizations = await db.select().from(schema.organizations);
  return { organizations };
};

const createOrganizationWithDetailsSchema = zfd.formData({
  // Organization fields
  name: zfd.text(),
  type: zfd.text(z.enum(['inhouse', 'consultant', 'association'])),
  is_commercial: zfd.text(z.coerce.boolean()),
  sector: zfd.text(),
  address: zfd.text(z.string().optional()),

  // Lobbyists (repeatable)
  lobbyist_names: zfd.repeatable(z.array(zfd.text()).optional()),
  lobbyist_functions: zfd.repeatable(z.array(zfd.text()).optional()),

  // Representations (repeatable) - only client IDs since representative_id will be the new org
  client_ids: zfd.repeatable(z.array(zfd.text(z.uuid())).optional()),
});

export const actions: Actions = {
  createOrganizationWithDetails: async ({ request }) => {
    const parsed = createOrganizationWithDetailsSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return fail(400, { message: 'Ongeldige gegevens' });
    }

    const {
      name,
      type,
      is_commercial,
      sector,
      address,
      lobbyist_names,
      lobbyist_functions,
      client_ids,
    } = parsed.data;

    try {
      // Start transaction-like operation
      // 1. Create the organization
      const [organization] = await db
        .insert(schema.organizations)
        .values({
          name,
          type,
          is_commercial,
          sector,
          address,
        })
        .returning();

      // 2. Create lobbyists if provided
      if (lobbyist_names && lobbyist_functions) {
        const lobbyists = lobbyist_names
          .map((name, index) => ({
            organization_id: organization.id,
            name: name.trim(),
            function: lobbyist_functions[index]?.trim() || '',
          }))
          .filter((lobbyist) => lobbyist.name && lobbyist.function);

        if (lobbyists.length > 0) {
          await db.insert(schema.lobbyists).values(lobbyists);
        }
      }

      // 3. Create representations if this is a consultant and client_ids provided
      if (type === 'consultant' && client_ids && client_ids.length > 0) {
        const representations = client_ids
          .filter((clientId) => clientId.trim())
          .map((clientId) => ({
            representative_id: organization.id,
            client_id: clientId.trim(),
          }));

        if (representations.length > 0) {
          await db.insert(schema.organization_representatives).values(representations);
        }
      }

      return redirect(302, `/?created=${organization.id}`);
    } catch (error) {
      if (isRedirect(error)) throw error;
      console.error('Error creating organization with details:', error);
      return fail(500, { message: 'Organisatie aanmaken mislukt' });
    }
  },
};
