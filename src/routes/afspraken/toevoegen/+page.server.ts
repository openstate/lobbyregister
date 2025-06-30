import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';
import { meetingTypeLabels, policyAreaLabels } from '../../../types';
import { MEETING_TYPES } from '$lib/constants';

export const load: PageServerLoad = async () => {
  // TODO: Fetch all lobbyists and their organizations
  const lobbyistsPromise = db
    .select({
      id: schema.lobbyists.id,
      name: schema.lobbyists.name,
      function: schema.lobbyists.function,
    })
    .from(schema.lobbyists)
    .where(eq(schema.lobbyists.active, true));

  // TODO: Fetch client representations
  const representationsPromise = db
    .select({
      id: schema.organization_representatives.id,
      representative_name: schema.lobbyist_organizations.name,
      representative_id: schema.organization_representatives.representative_id,
      client_name: schema.client_organizations.name,
      client_id: schema.organization_representatives.client_id,
    })
    .from(schema.organization_representatives)
    .innerJoin(schema.meeting_representatives, eq(schema.organization_representatives.id, schema.meeting_representatives.representation_id))
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

  const [lobbyists, representations, allOfficials] = await Promise.all([
    lobbyistsPromise,
    representationsPromise,
    allOfficialsPromise
  ]);

  const allOfficialsOptions = allOfficials.map((official) => ({label: official.name, value: official.id}))
  const allPolicyAreaOptions = policyAreaLabels.map((pal) => ({label: pal, value: pal}));

  return {
    lobbyists,
    representations,
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

    const { description, meeting_type, meeting_location, meeting_date, policy_areas, selected_officials } = parsed.data;

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

    for (const official of selected_officials) {
      const [meeting_official] = await db
      .insert(schema.meeting_officials)
      .values({
        meeting_id: meeting.id,
        official_id: official
      })
      .returning();
    }
      
    return fail(400, {
      message: 'DEV: RETURN 400 SO THAT FORM FIELDS WILL STILL BE FILLED IN',
    });

    // return redirect(302, '/');
  },
};
