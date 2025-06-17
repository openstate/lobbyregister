import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import type { Actions } from '@sveltejs/kit';

export const load = async () => {
  const [allMeetings, allOfficials, allLobbyists, allOrganizations] = await Promise.all([
    db.select().from(schema.meetings),
    db.select().from(schema.officials),
    db.select().from(schema.lobbyists),
    db.select().from(schema.organizations),
  ]);

  // Get meeting participants
  const meetingOfficials = await db
    .select({
      meeting_id: schema.meeting_officials.meeting_id,
      official: schema.officials,
    })
    .from(schema.meeting_officials)
    .leftJoin(schema.officials, eq(schema.meeting_officials.official_id, schema.officials.id));

  const meetingLobbyists = await db
    .select({
      id: schema.meeting_lobbyists.id,
      meeting_id: schema.meeting_lobbyists.meeting_id,
      lobbyist: schema.lobbyists,
      organization: schema.organizations,
    })
    .from(schema.meeting_lobbyists)
    .leftJoin(schema.lobbyists, eq(schema.meeting_lobbyists.lobbyist_id, schema.lobbyists.id))
    .leftJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id));

  // Get client representations for meetings
  const meetingRepresentations = await db
    .select({
      meeting_lobbyist_id: schema.meeting_representatives.meeting_lobbyist_id,
      client: schema.organizations,
    })
    .from(schema.meeting_representatives)
    .leftJoin(
      schema.organization_representatives,
      eq(schema.meeting_representatives.representation_id, schema.organization_representatives.id),
    )
    .leftJoin(
      schema.organizations,
      eq(schema.organization_representatives.client_id, schema.organizations.id),
    );

  const representatives = await db.select().from(schema.organization_representatives);

  return {
    meetings: allMeetings,
    officials: allOfficials,
    lobbyists: allLobbyists,
    organizations: allOrganizations,
    meetingOfficials,
    meetingLobbyists,
    meetingRepresentations,
    representatives,
  };
};

const createMeetingSchema = zfd.formData({
  type: zfd.text(z.enum(['in_person', 'phone_call', 'video_call'])),
  location: zfd.text(z.string().optional()),
  description: zfd.text(),
  official_ids: zfd.repeatable(z.array(zfd.text(z.uuid())).min(1)),
  lobbyist_ids: zfd.repeatable(z.array(zfd.text(z.uuid())).min(1)),
  representations: zfd.repeatableOfType(
    zfd.text(
      z
        .string()
        .transform((val) => val.split(':'))
        .pipe(z.tuple([z.uuid(), z.uuid()]))
        .transform(([lobbyist_id, representation_id]) => ({ lobbyist_id, representation_id })),
    ),
  ),
});

export const actions: Actions = {
  createMeeting: async ({ request }) => {
    const parsed = createMeetingSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { message: 'Invalid data', errors: parsed.error });
    }

    const { type, location, description, official_ids, lobbyist_ids, representations } =
      parsed.data;

    console.dir(parsed.data);

    try {
      const meeting_id = crypto.randomUUID();

      // Create the meeting
      const [meeting] = await db
        .insert(schema.meetings)
        .values({ id: meeting_id, type, location, description })
        .returning();

      // Add officials to meeting
      await db
        .insert(schema.meeting_officials)
        .values(official_ids.map((official_id) => ({ meeting_id, official_id })));

      // Add lobbyists to meeting
      const meeting_lobbyists = await db
        .insert(schema.meeting_lobbyists)
        .values(lobbyist_ids.map((lobbyist_id) => ({ meeting_id, lobbyist_id })))
        .returning();

      // Add client representations if specified
      if (representations.length > 0) {
        await db.insert(schema.meeting_representatives).values(
          representations.map(({ lobbyist_id, representation_id }) => {
            const meeting_lobbyist_id = meeting_lobbyists.find(
              (l) => l.lobbyist_id === lobbyist_id,
            )?.id;

            if (!meeting_lobbyist_id)
              throw new Error(`Lobbyist ${lobbyist_id} not found in meeting lobbyists`);

            return { meeting_lobbyist_id, representation_id };
          }),
        );
      }

      return { success: true, meeting };
    } catch (error) {
      console.error('Error creating meeting:', error);
      return fail(500, { message: 'Failed to create meeting' });
    }
  },
};
