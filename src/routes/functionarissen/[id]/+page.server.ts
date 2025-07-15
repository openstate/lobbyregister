import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params: { id } }) => {
  const [official] = await db
    .select()
    .from(schema.officials)
    .where(eq(schema.officials.id, id))
    .limit(1);

  if (!official) throw error(404, 'Gemeentefunctionaris niet gevonden');

  const meetings = await db
    .select({
      id: schema.meetings.id,
      type: schema.meetings.type,
      date: schema.meetings.date,
      description: schema.meetings.description,
      location: schema.meetings.location,
      policy_areas: schema.meetings.policy_areas,
      registered_at: schema.meetings.registered_at,
    })
    .from(schema.meetings)
    .leftJoin(schema.meeting_officials, eq(schema.meetings.id, schema.meeting_officials.meeting_id))
    .where(eq(schema.meeting_officials.official_id, id))
    .orderBy(schema.meetings.date)
    .limit(4);

  return { official, meetings };
};
