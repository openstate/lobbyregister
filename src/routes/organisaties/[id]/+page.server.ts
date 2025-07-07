import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { SBI_CODES } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { alias } from 'drizzle-orm/pg-core';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  // Fetch the organization by ID
  const [organization] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.id, id))
    .limit(1);

  if (!organization) {
    throw error(404, 'Lobbyorganisatie niet gevonden');
  }

  // Fetch lobbyists associated with this organization
  const lobbyistsPromise = db
    .select({
      id: schema.lobbyists.id,
      name: schema.lobbyists.name,
      function: schema.lobbyists.function,
    })
    .from(schema.lobbyists)
    .where(eq(schema.lobbyists.organization_id, id));

  // If this is a consultant organization, fetch client representations
  const client_organizations = alias(schema.organizations, 'client_organizations');
  const clientOrganizationsPromise =
    organization.type === 'consultant'
      ? db
          .select({
            client_id: schema.organization_representatives.client_id,
            client_name: client_organizations.name,
            client_sector: client_organizations.sector,
          })
          .from(schema.organization_representatives)
          .leftJoin(
            client_organizations,
            eq(schema.organization_representatives.client_id, client_organizations.id),
          )
          .where(eq(schema.organization_representatives.representative_id, id))
      : Promise.resolve([]);

  // Fetch consultant organizations that represent this organization
  const lobbyist_organizations = alias(schema.organizations, 'lobbyist_organizations');
  const representativeOrganizationsPromise = db
    .select({
      representative_id: schema.organization_representatives.representative_id,
      representative_name: lobbyist_organizations.name,
    })
    .from(schema.organization_representatives)
    .leftJoin(
      lobbyist_organizations,
      eq(schema.organization_representatives.representative_id, lobbyist_organizations.id),
    )
    .where(eq(schema.organization_representatives.client_id, id));

  const [lobbyists, clientOrganizations, representativeOrganizations] = await Promise.all([
    lobbyistsPromise,
    clientOrganizationsPromise,
    representativeOrganizationsPromise,
  ]);

  return {
    organization,
    lobbyists,
    clientOrganizations,
    representativeOrganizations,
  };
};
