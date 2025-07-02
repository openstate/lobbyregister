import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';
import { meetingTypeLabels, policyAreaLabels } from '../../../types';
import { MEETING_TYPES } from '$lib/constants';

export type clientData = { label: string, value: string};

export const load: PageServerLoad = async () => {
  // Fetch all lobbyists and their organizations
  const allLobbyistsPromise = db
    .select({
      id: schema.lobbyists.id,
      name: schema.lobbyists.name,
      function: schema.lobbyists.function,
      organization_id: schema.organizations.id,
      organization_name: schema.organizations.name,
      is_consultant: sql<string>`${schema.organizations.type} = 'consultant'`
    })
    .from(schema.lobbyists)
    .innerJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id))
    .where(eq(schema.lobbyists.active, true));

  // Fetch client representatives
  const allRepresentativesPromise = db
    .select({
      id: schema.organization_representatives.id,
      representative_name: schema.lobbyist_organizations.name,
      representative_id: schema.organization_representatives.representative_id,
      client_name: schema.client_organizations.name,
      client_id: schema.organization_representatives.client_id,
    })
    .from(schema.organization_representatives)
    .innerJoin(schema.lobbyist_organizations, eq(schema.organization_representatives.representative_id, schema.lobbyist_organizations.id))
    .innerJoin(schema.client_organizations, eq(schema.organization_representatives.client_id, schema.client_organizations.id))
    .where(eq(schema.organization_representatives.active, true));

  const meetingTypes = Object.entries(meetingTypeLabels).map((mt) => mt);

  // Fetch all officials
  const allOfficialsPromise = db
    .select({
      id: schema.officials.id,
      name: schema.officials.name,
      type: schema.officials.type,
      department: schema.officials.department,
    })
    .from(schema.officials)
    .where(eq(schema.officials.active, true));

  const [allLobbyists, allRepresentatives, allOfficials] = await Promise.all([
    allLobbyistsPromise,
    allRepresentativesPromise,
    allOfficialsPromise
  ]);

  const allOfficialsOptions = allOfficials.map((official) => ({label: official.name, value: official.id}));
  const allLobbyistsOptions = allLobbyists.map((lobbyist) => ({
    label: `${lobbyist.name}, ${lobbyist.function} (${lobbyist.organization_name})} `, 
    value: lobbyist.id,
  }));
  const clientsForRepresentatives: { [key: string]: Array<clientData>} = {};
  for (let representative of allRepresentatives) {
    if (!(representative.representative_id in clientsForRepresentatives)) {
      clientsForRepresentatives[representative.representative_id] = [];
    }
    clientsForRepresentatives[representative.representative_id].push({
      value: representative.client_id, label: representative.client_name
    })
  }
  const allRepresentativeNames: { [key:string]: string } = Object.assign({}, ...allRepresentatives.map((x) => ({[x.representative_id]: x.representative_name})));
  const allPolicyAreaOptions = policyAreaLabels.map((pal) => ({label: pal, value: pal}));
  const ids = allLobbyists.filter((lobbyist) => lobbyist.is_consultant).map((lobbyist) => [lobbyist.id, lobbyist.organization_id]);
  const consultantsToOrganizations: { [key:string]: string } = Object.assign({}, ...ids.map((x) => ({[x[0]]: x[1]})));

  return {
    allLobbyistsOptions,
    consultantsToOrganizations,
    clientsForRepresentatives,
    allRepresentativeNames,
    meetingTypes,
    allOfficialsOptions,
    allPolicyAreaOptions
  };
};

const createOfficialSchema = zfd.formData({
  description: zfd.text(),
  policy_areas: z.preprocess((value) => JSON.parse(value as string), z.array(z.string())),
  meeting_type: z.enum(MEETING_TYPES),
  meeting_location: zfd.text(),
  meeting_date: zfd.text(),
  selected_officials: z.preprocess((value) => JSON.parse(value as string), z.array(z.string())),
  selected_lobbyists: z.preprocess((value) => JSON.parse(value as string), z.array(z.string())),
  selected_clients: z.preprocess((value) => JSON.parse(value as string), z.record(z.string(), z.array(z.object({value: z.string(), label: z.string()}))))
});

export const actions: Actions = {
  default: async ({ request }) => {
    const parsed = createOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return fail(400, {
        message: 'Ongeldige gegevens. Controleer of alle vereiste velden zijn ingevuld.',
      });
    }

    const { description, meeting_type, meeting_location, meeting_date, policy_areas, 
      selected_officials, selected_lobbyists, selected_clients } = parsed.data;

    const [meeting] = await db
      .insert(schema.meetings)
      .values({ 
        description: description.trim(),
        date: meeting_date,
        type: meeting_type,
        location: meeting_location.trim(),
        policy_areas: policy_areas,
      })
      .returning();

    for (const official_id of selected_officials) {
      const [meeting_official] = await db
      .insert(schema.meeting_officials)
      .values({
        meeting_id: meeting.id,
        official_id: official_id
      })
      .returning();
    }


    let meetingLobbyistIds: { [key: string]: string } = {};
    for (const lobbyist_id of selected_lobbyists) {
      const [meeting_lobbyist] = await db
      .insert(schema.meeting_lobbyists)
      .values({
        meeting_id: meeting.id,
        lobbyist_id: lobbyist_id
      })
      .returning();
      meetingLobbyistIds[lobbyist_id] = meeting_lobbyist.id;
    }

    // Fetch all consultant lobbyists and their organizations
    let filters = [
      eq(schema.lobbyists.active, true),
      eq(schema.organizations.type, 'consultant')
    ];
    const allConsultantLobbyistsPromise = db
      .select({
        id: schema.lobbyists.id,
        organization_id: schema.organizations.id,
      })
      .from(schema.lobbyists)
      .innerJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id))
      .where(and(...filters));

      // Fetch client representatives
    const allRepresentativesPromise = db
      .select({
        id: schema.organization_representatives.id,
        representative_id: schema.organization_representatives.representative_id,
        client_id: schema.organization_representatives.client_id,
      })
      .from(schema.organization_representatives)
      .where(eq(schema.organization_representatives.active, true));


    const [allConsultantLobbyists, allRepresentatives] = await Promise.all([
      allConsultantLobbyistsPromise,
      allRepresentativesPromise,
    ]);

    // Create dict of organizationId to array of lobbyists
    const organizationsToLobbyists: { [key: string]: string[]} = {};
    for (let lobbyist of allConsultantLobbyists) {
      if (!(lobbyist.organization_id in organizationsToLobbyists)) {
        organizationsToLobbyists[lobbyist.organization_id] = [];
      }
      organizationsToLobbyists[lobbyist.organization_id].push(lobbyist.id);
    }

    for (let [organizationId, clients] of Object.entries(selected_clients)) {
      for (let clientOption of clients) {
        // Get id from organization_representatives table
        let orgRepId = allRepresentatives.filter((rep) => {return rep.representative_id == organizationId && rep.client_id == clientOption.value})[0].id;
        for (let lobbyistId of organizationsToLobbyists[organizationId]) {
          if (!meetingLobbyistIds[lobbyistId]) continue;
          const [meeting_representative] = await db
            .insert(schema.meeting_representatives)
            .values({
              meeting_lobbyist_id: meetingLobbyistIds[lobbyistId],
              representation_id: orgRepId
            })
            .returning();
        }
      }
    }

    return redirect(302, '/afspraken');
  },
};
