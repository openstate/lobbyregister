import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

export const load = async () => {
  const [organizations, officials, lobbyists, representatives] = await Promise.all([
    db.select().from(schema.organizations),
    db.select().from(schema.officials),
    db.select().from(schema.lobbyists),
    db.select().from(schema.organization_representatives),
  ]);

  return { organizations, officials, lobbyists, representatives };
};
