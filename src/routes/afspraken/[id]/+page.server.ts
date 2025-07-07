import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { alias } from 'drizzle-orm/pg-core';

export const load: PageServerLoad = async ({ params: { id } }) => {
  // Fetch the meeting by ID
  const [meeting] = await db
    .select()
    .from(schema.meetings)
    .where(eq(schema.meetings.id, id))
    .limit(1);

  if (!meeting) throw error(404, 'Afspraak niet gevonden');

  // Fetch officials associated with this meeting
  const officialsPromise = db
    .select({
      id: schema.officials.id,
      name: schema.officials.name,
      type: schema.officials.type,
      department: schema.officials.department,
    })
    .from(schema.officials)
    .leftJoin(schema.meeting_officials, eq(schema.officials.id, schema.meeting_officials.official_id))
    .where(eq(schema.meeting_officials.meeting_id, id));

  // Fetch lobbyists and their organizations associated with this meeting
  const lobbyistsPromise = db
    .select({
      id: schema.lobbyists.id,
      meeting_lobbyist_id: schema.meeting_lobbyists.id,
      name: schema.lobbyists.name,
      function: schema.lobbyists.function,
      organization_id: schema.organizations.id,
      organization_name: schema.organizations.name,
      organization_type: schema.organizations.type,
    })
    .from(schema.lobbyists)
    .innerJoin(schema.meeting_lobbyists, eq(schema.lobbyists.id, schema.meeting_lobbyists.lobbyist_id))
    .innerJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id))
    .where(eq(schema.meeting_lobbyists.meeting_id, id));

  // Fetch client representations for this meeting
  const lobbyist_organizations = alias(schema.organizations, 'lobbyist_organizations');
  const client_organizations = alias(schema.organizations, 'client_organizations');
  const representationsPromise = db
    .select({
      id: schema.organization_representatives.id,
      meeting_lobbyist_id: schema.meeting_representatives.meeting_lobbyist_id,
      representative_name: lobbyist_organizations.name,
      representative_id: schema.organization_representatives.representative_id,
      client_name: client_organizations.name,
      client_id: schema.organization_representatives.client_id,
    })
    .from(schema.organization_representatives)
    .innerJoin(schema.meeting_representatives, eq(schema.organization_representatives.id, schema.meeting_representatives.representation_id))
    .innerJoin(schema.meeting_lobbyists, eq(schema.meeting_representatives.meeting_lobbyist_id, schema.meeting_lobbyists.id))
    .innerJoin(lobbyist_organizations, eq(schema.organization_representatives.representative_id, lobbyist_organizations.id))
    .innerJoin(client_organizations, eq(schema.organization_representatives.client_id, client_organizations.id))
    .where(eq(schema.meeting_lobbyists.meeting_id, id));

  const [officials, lobbyists, representations] = await Promise.all([
    officialsPromise,
    lobbyistsPromise,
    representationsPromise,
  ]);

  return {
    meeting,
    officials,
    lobbyists,
    representations,
  };
};
