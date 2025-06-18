import { MEETING_TYPES, OFFICIAL_TYPES, ORGANIZATION_TYPES } from '../../constants.ts';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  pgEnum,
  boolean,
  text,
  primaryKey,
  date,
  integer,
  check,
} from 'drizzle-orm/pg-core';

const registeredAt = () => date().notNull().defaultNow();

const updatedAt = () => registeredAt().$onUpdate(() => sql`now()`);

export const organization_type = pgEnum('organization_type', ORGANIZATION_TYPES);

export const meeting_type = pgEnum('meeting_type', MEETING_TYPES);

export const official_type = pgEnum('official_type', OFFICIAL_TYPES);

export const organizations = pgTable('organizations', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  type: organization_type().notNull(),
  kvk_number: integer(),
  is_commercial: boolean().notNull(),
  sector: text().notNull(),
  address: text(),
  active: boolean().notNull().default(true),
  registered_at: registeredAt(),
  updated_at: updatedAt(),
});

export const organization_representatives = pgTable('organization_representatives', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  representative_id: uuid()
    .notNull()
    .references(() => organizations.id),
  client_id: uuid()
    .notNull()
    .references(() => organizations.id),
  active: boolean().notNull().default(true),
  registered_at: registeredAt(),
  updated_at: updatedAt(),
});

export const lobbyists = pgTable('lobbyists', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  organization_id: uuid()
    .notNull()
    .references(() => organizations.id),
  name: text().notNull(),
  function: text().notNull(),
  active: boolean().notNull().default(true),
  registered_at: registeredAt(),
  updated_at: updatedAt(),
});

export const meetings = pgTable('meetings', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  type: meeting_type().notNull(),
  date: date().notNull(),
  duration_minutes: integer().notNull(),
  description: text().notNull(),
  location: text(),
  registered_at: registeredAt(),
  updated_at: updatedAt(),
});

export const officials = pgTable('officials', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  type: official_type().notNull(),
  department: text().notNull(),
  active: boolean().notNull().default(true),
  registered_at: registeredAt(),
  updated_at: updatedAt(),
});

export const meeting_officials = pgTable(
  'meeting_officials',
  {
    meeting_id: uuid()
      .notNull()
      .references(() => meetings.id),
    official_id: uuid()
      .notNull()
      .references(() => officials.id),
  },
  (table) => [primaryKey({ columns: [table.official_id, table.meeting_id] })],
);

export const meeting_lobbyists = pgTable('meeting_lobbyists', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  meeting_id: uuid()
    .notNull()
    .references(() => meetings.id),
  lobbyist_id: uuid()
    .notNull()
    .references(() => lobbyists.id),
});

export const meeting_representatives = pgTable(
  'meeting_representatives',
  {
    meeting_lobbyist_id: uuid()
      .notNull()
      .references(() => meeting_lobbyists.id),
    representation_id: uuid()
      .notNull()
      .references(() => organization_representatives.id),
  },
  (t) => [primaryKey({ columns: [t.meeting_lobbyist_id, t.representation_id] })],
);
