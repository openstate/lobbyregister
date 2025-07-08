import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { alias } from 'drizzle-orm/pg-core';

export async function loadOrganizationData(id: string) {
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
  const filters = [
    eq(schema.lobbyists.active, true),
    eq(schema.lobbyists.organization_id, id)
  ];
  const lobbyistsPromise = db
    .select({
      id: schema.lobbyists.id,
      name: schema.lobbyists.name,
      function: schema.lobbyists.function,
    })
    .from(schema.lobbyists)
    .where(and(...filters));

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
          .innerJoin(
            client_organizations,
            eq(schema.organization_representatives.client_id, client_organizations.id),
          )
          .where(and(...[
            eq(schema.organization_representatives.representative_id, id),
            eq(schema.organization_representatives.active, true)
          ]))
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
    .where(and(...[
      eq(schema.organization_representatives.client_id, id),
      eq(schema.organization_representatives.active, true)
    ]));

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
}