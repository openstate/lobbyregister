import { pgTable, uuid, pgEnum, boolean, text, primaryKey } from 'drizzle-orm/pg-core';

export const organization_type = pgEnum('organization_type', [
  'inhouse',
  'consultant',
  'association',
]);

export const meeting_type = pgEnum('meeting_type', ['in_person', 'phone_call', 'video_call']);

export const organizations = pgTable('organizations', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  type: organization_type().notNull(),
  is_commercial: boolean().notNull(),
  sector: text().notNull(),
  address: text(),
});

export const organization_representatives = pgTable('organization_representatives', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  representative_id: uuid()
    .notNull()
    .references(() => organizations.id),
  client_id: uuid()
    .notNull()
    .references(() => organizations.id),
});

export const lobbyists = pgTable('lobbyists', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  organization_id: uuid()
    .notNull()
    .references(() => organizations.id),
  name: text().notNull(),
  function: text().notNull(),
});

export const meetings = pgTable('meetings', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  type: meeting_type().notNull(),
  location: text(),
  description: text().notNull(),
});

export const officials = pgTable('officials', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  function: text().notNull(),
  department: text().notNull(),
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
