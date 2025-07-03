import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { meetingTypeLabels, searchCategoryTypes } from '../../types';

const MEETINGS_PER_PAGE = 10;

export const load: PageServerLoad = async ({ url }) => {
  const searchParams = url.searchParams;

  // Get pagination parameters
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const offset = (page - 1) * MEETINGS_PER_PAGE;

  // Get filter parameters - handle multiple values
  const search = searchParams.get('search')?.trim().toLocaleLowerCase() || '';
  const searchCategories = searchParams.getAll('searchCategories').filter((id) => id.trim()) as searchCategoryTypes[];
  if (searchCategories.length == 0) searchCategories.push(searchCategoryTypes.searchMeetingsId);
  const officialIds = searchParams.getAll('official').filter((id) => id.trim());
  const lobbyistIds = searchParams.getAll('lobbyist').filter((id) => id.trim());
  const organizationIds = searchParams.getAll('organization').filter((id) => id.trim());
  const policyAreasFilter = searchParams.getAll('policy_area').filter((area) => area.trim());
  const meetingType = searchParams.get('type') || '';

  // Build base WHERE conditions
  const baseConditions = [];
  if (search) {
    let searchConditions = [];
    if (searchCategories.includes(searchCategoryTypes.searchMeetingsId)) {
      searchConditions.push(ilike(schema.meetings.description, `%${search}%`));
    }
    if (searchCategories.includes(searchCategoryTypes.searchOrganizationsId)) {
      searchConditions.push(ilike(schema.organizations.name, `%${search}%`));
      searchConditions.push(ilike(schema.client_organizations.name, `%${search}%`));
    }
    if (searchCategories.includes(searchCategoryTypes.searchLobbyistsId)) {
      searchConditions.push(ilike(schema.lobbyists.name, `%${search}%`));
    }
    if (searchConditions.length > 0) baseConditions.push(or(...searchConditions));
  }
  if (meetingType) {
    baseConditions.push(eq(schema.meetings.type, meetingType as any));
  }
  if (policyAreasFilter.length > 0) {
    const policyAreaConditions = policyAreasFilter.map(
      (area) => sql`${schema.meetings.policy_areas} && ARRAY[${area}]`,
    );
    baseConditions.push(sql`(${sql.join(policyAreaConditions, sql` OR `)})`);
  }

  // Build filter conditions for related entities
  const entityConditions = [];
  if (officialIds.length > 0) {
    entityConditions.push(sql`EXISTS (
      SELECT 1 FROM ${schema.meeting_officials} mo
      WHERE mo.meeting_id = ${schema.meetings.id}
      AND mo.official_id IN (${sql.join(
        officialIds.map((id) => sql`${id}`),
        sql`, `,
      )})
    )`);
  }
  if (lobbyistIds.length > 0) {
    entityConditions.push(sql`EXISTS (
      SELECT 1 FROM ${schema.meeting_lobbyists} ml
      WHERE ml.meeting_id = ${schema.meetings.id}
      AND ml.lobbyist_id IN (${sql.join(
        lobbyistIds.map((id) => sql`${id}`),
        sql`, `,
      )})
    )`);
  }
  if (organizationIds.length > 0) {
    entityConditions.push(sql`EXISTS (
      SELECT 1 FROM ${schema.meeting_lobbyists} ml
      JOIN ${schema.lobbyists} l ON ml.lobbyist_id = l.id
      WHERE ml.meeting_id = ${schema.meetings.id}
      AND l.organization_id IN (${sql.join(
        organizationIds.map((id) => sql`${id}`),
        sql`, `,
      )})
    )`);
  }

  // Combine all conditions
  const allConditions = [...baseConditions, ...entityConditions];
  const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

  // Get meetings and related data in parallel
  const [meetings, countResult, filterOptions] = await Promise.all([
    // Main meetings query
    db
      .selectDistinct({
        id: schema.meetings.id,
        type: schema.meetings.type,
        date: schema.meetings.date,
        description: schema.meetings.description,
        location: schema.meetings.location,
        policy_areas: schema.meetings.policy_areas,
      })
      .from(schema.meetings)
      .where(whereClause)
      .leftJoin(schema.meeting_lobbyists, eq(schema.meetings.id, schema.meeting_lobbyists.meeting_id))
      .leftJoin(schema.lobbyists, eq(schema.meeting_lobbyists.lobbyist_id, schema.lobbyists.id))
      .leftJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id))
      .leftJoin(schema.meeting_representatives, eq(schema.meeting_lobbyists.id, schema.meeting_representatives.meeting_lobbyist_id))
      .leftJoin(schema.organization_representatives, eq(schema.meeting_representatives.representation_id, schema.organization_representatives.id))
      .leftJoin(schema.client_organizations, eq(schema.organization_representatives.client_id, schema.client_organizations.id))
      .orderBy(desc(schema.meetings.date))
      .limit(MEETINGS_PER_PAGE)
      .offset(offset),

    // Count query
    db
      .select({ count: sql<number>`count(distinct ${schema.meetings.id})` })
      .from(schema.meetings)
      .where(whereClause)
      .leftJoin(schema.meeting_lobbyists, eq(schema.meetings.id, schema.meeting_lobbyists.meeting_id))
      .leftJoin(schema.lobbyists, eq(schema.meeting_lobbyists.lobbyist_id, schema.lobbyists.id))
      .leftJoin(schema.organizations, eq(schema.lobbyists.organization_id, schema.organizations.id))
      .leftJoin(schema.meeting_representatives, eq(schema.meeting_lobbyists.id, schema.meeting_representatives.meeting_lobbyist_id))
      .leftJoin(schema.organization_representatives, eq(schema.meeting_representatives.representation_id, schema.organization_representatives.id))
      .leftJoin(schema.client_organizations, eq(schema.organization_representatives.client_id, schema.client_organizations.id)),

    // Filter options
    Promise.all([
      // Officials
      db
        .select({
          id: schema.officials.id,
          name: schema.officials.name,
          department: schema.officials.department,
        })
        .from(schema.officials)
        .where(eq(schema.officials.active, true))
        .orderBy(schema.officials.name),
      // Lobbyists and their organizations
      db
        .select({
          id: schema.lobbyists.id,
          name: schema.lobbyists.name,
          organization_name: schema.organizations.name,
        })
        .from(schema.lobbyists)
        .leftJoin(
          schema.organizations,
          eq(schema.lobbyists.organization_id, schema.organizations.id),
        )
        .where(eq(schema.lobbyists.active, true))
        .orderBy(schema.lobbyists.name),
      // Organizations
      db
        .select({
          id: schema.organizations.id,
          name: schema.organizations.name,
          type: schema.organizations.type,
        })
        .from(schema.organizations)
        .where(eq(schema.organizations.active, true))
        .orderBy(schema.organizations.name),
      // Policy areas
      db
        .selectDistinct({ policy_area: sql<string>`unnest(${schema.meetings.policy_areas})` })
        .from(schema.meetings)
        .where(sql`array_length(${schema.meetings.policy_areas}, 1) > 0`)
        .orderBy(sql`unnest(${schema.meetings.policy_areas})`),
    ]),
  ]);

  const [officials, lobbyists, organizations, policyAreasFromDB] = filterOptions;
  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / MEETINGS_PER_PAGE);
  const meetingIds = meetings.map((m) => m.id);

  // Now fetch officials and lobbyists only for the meetings on this page
  const [meetingOfficials, meetingLobbyists] = await Promise.all([
    meetingIds.length > 0
      ? db
          .select({
            meeting_id: schema.meeting_officials.meeting_id,
            official_id: schema.officials.id,
            official_name: schema.officials.name,
            official_type: schema.officials.type,
            department: schema.officials.department,
          })
          .from(schema.meeting_officials)
          .leftJoin(schema.officials, eq(schema.meeting_officials.official_id, schema.officials.id))
          .where(inArray(schema.meeting_officials.meeting_id, meetingIds))
      : [],
    meetingIds.length > 0
      ? db
          .select({
            meeting_id: schema.meeting_lobbyists.meeting_id,
            lobbyist_id: schema.lobbyists.id,
            lobbyist_name: schema.lobbyists.name,
            lobbyist_function: schema.lobbyists.function,
            organization_id: schema.organizations.id,
            organization_name: schema.organizations.name,
            organization_type: schema.organizations.type,
          })
          .from(schema.meeting_lobbyists)
          .leftJoin(schema.lobbyists, eq(schema.meeting_lobbyists.lobbyist_id, schema.lobbyists.id))
          .leftJoin(
            schema.organizations,
            eq(schema.lobbyists.organization_id, schema.organizations.id),
          )
          .where(inArray(schema.meeting_lobbyists.meeting_id, meetingIds))
      : [],
  ]);

  // Combine meeting data with related entities
  const meetingsWithDetails = meetings.map((meeting) => {
    const officials = meetingOfficials
      .filter((mo) => mo.meeting_id === meeting.id)
      .map((mo) => ({
        id: mo.official_id,
        name: mo.official_name,
        type: mo.official_type,
        department: mo.department,
      }));

    const lobbyistsData = meetingLobbyists
      .filter((ml) => ml.meeting_id === meeting.id)
      .map((ml) => ({
        id: ml.lobbyist_id,
        name: ml.lobbyist_name,
        function: ml.lobbyist_function,
        organization: {
          id: ml.organization_id,
          name: ml.organization_name,
          type: ml.organization_type,
        },
      }));

    const organizations = Array.from(
      new Map(lobbyistsData.map((l) => [l.organization.id, l.organization])).values(),
    );

    return {
      ...meeting,
      officials,
      lobbyists: lobbyistsData,
      organizations,
    };
  });

  return {
    meetings: meetingsWithDetails,
    pagination: {
      page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      search,
      searchCategories,
      officialIds,
      lobbyistIds,
      organizationIds,
      policyAreas: policyAreasFilter,
      meetingType,
    },
    filterOptions: {
      officials,
      lobbyists,
      organizations,
      policyAreas: policyAreasFromDB.map((row) => row.policy_area).filter(Boolean),
      meetingTypes: Object.entries(meetingTypeLabels).map((key, value) => ({value: key, label: value})),
    },
  };
};
