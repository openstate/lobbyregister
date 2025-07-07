import * as schema from './schema.ts';
import { db } from './index.ts';
import { getTableName, sql } from "drizzle-orm";

async function drop_tables() {
  console.log('🌱 Starting dropping all tables in database...');

  try {
    // Drop all tables
    console.log('🧹 DROPPING ALL TABLES...');
    const tables = [
      schema.meeting_representatives,
      schema.meeting_lobbyists,
      schema.meeting_officials,
      schema.organization_representatives,
      schema.meetings,
      schema.lobbyists,
      schema.officials,
      schema.organizations,
    ];

    for (const table of tables) {
      const tableName = getTableName(table);
      console.log(`❌ dropping table ${tableName}`)
      await db.execute(`DROP TABLE IF EXISTS ${tableName};`)
    }
  } catch (error) {
    console.error('❌ Error dropping tables of database:', error);
    throw error;
  }
}

// Run the drop_tables function
drop_tables()
  .catch((error) => {
    console.error('Failed to drop tables of database:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
