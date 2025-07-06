import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { organizationTypeLabels } from '../../types.js';

const ORGANIZATIONS_PER_PAGE = 10;

export const load: PageServerLoad = async ({ url }) => {
  const searchParams = url.searchParams;

  // Get pagination parameters
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const offset = (page - 1) * ORGANIZATIONS_PER_PAGE;

  // Get filter parameters
  const search = searchParams.get('search')?.trim().toLocaleLowerCase() || '';
  const organizationType = (searchParams.get('type') || undefined) as keyof typeof organizationTypeLabels;

  // Build base WHERE conditions
  const baseConditions = [eq(schema.organizations.active, true)];
  if (search) {
    baseConditions.push(ilike(schema.organizations.name, `%${search}%`));
  }
  if (organizationType) {
    baseConditions.push(eq(schema.organizations.type, organizationType as any));
  }

  const whereClause = and(...baseConditions);

  const [organizations, countResult] = await Promise.all([
    db
      .selectDistinct({
        id: schema.organizations.id,
        name: schema.organizations.name,
        type: schema.organizations.type,
        kvk_number: schema.organizations.kvk_number,
        city: schema.organizations.city,
        website: schema.organizations.website,
        is_commercial: schema.organizations.is_commercial,
        sector: schema.organizations.sector,
        active: schema.organizations.active,
        registered_at: schema.organizations.registered_at,
        updated_at: schema.organizations.updated_at,
      })
      .from(schema.organizations)
      .where(whereClause)
      .orderBy(schema.organizations.name)
      .limit(ORGANIZATIONS_PER_PAGE)
      .offset(offset),

    db
      .select({ count: sql<number>`count(distinct ${schema.organizations.id})` })
      .from(schema.organizations)
      .where(whereClause),
    ]);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / ORGANIZATIONS_PER_PAGE);

  return {
    organizations: organizations,
    pagination: {
      page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      search,
      organizationType,
    },
    filterOptions: {
      organizationTypes: organizationTypeLabels,
    },
  }
}