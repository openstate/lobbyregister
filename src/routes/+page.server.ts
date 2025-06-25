import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import { off } from 'process';

type Meeting = { id: string; date: string; description: string; departments: string[] };

async function getMeetings() {
  const meetings = await db
    .select({
      id: schema.meetings.id,
      date: schema.meetings.date,
      description: schema.meetings.description,
      department: schema.officials.department,
    })
    .from(schema.meetings)
    .leftJoin(schema.meeting_officials, eq(schema.meetings.id, schema.meeting_officials.meeting_id))
    .leftJoin(schema.officials, eq(schema.meeting_officials.official_id, schema.officials.id))
    .where(sql`${schema.meetings.id} IN (SELECT id FROM meetings ORDER BY date DESC LIMIT 5)`)
    .orderBy(desc(schema.meetings.date));

  return meetings.reduce<Meeting[]>((acc, row) => {
    let meeting = acc.find((m) => m.id === row.id);

    if (!meeting) {
      meeting = { ...row, departments: [] };
      acc.push(meeting);
    }

    if (row.department && !meeting.departments.some((p) => p === row.department))
      meeting.departments.push(row.department);

    return acc;
  }, []);
}

async function getRegistrations() {
  return db
    .select({
      id: schema.organizations.id,
      name: schema.organizations.name,
      type: schema.organizations.type,
      registered_at: schema.organizations.registered_at,
    })
    .from(schema.organizations)
    .orderBy(desc(schema.organizations.registered_at))
    .limit(5);
}

export async function load() {
  const [meetings, registrations] = await Promise.all([getMeetings(), getRegistrations()]);

  return { meetings, registrations };
}

export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const searchTerm = formData.get('search')?.toString().trim() || '';
    redirect(307, `/afspraken?search=${encodeURIComponent(searchTerm)}`);
  },
};
