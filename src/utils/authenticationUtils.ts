import type { Cookies } from "@sveltejs/kit";
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedUserTypes, PermissionTypes, type AuthenticatedUser } from "../types";

let USER_ID_COOKIE = 'userId';
let USER_TYPE_COOKIE = 'userType';
let AUTHENTICATION_COOKIE_PATH = '/';

export async function getAuthenticatedUser(cookies: Cookies) {
  let userId = cookies.get(USER_ID_COOKIE);
  let userType = cookies.get(USER_TYPE_COOKIE) as AuthenticatedUserTypes;

  if (!userId || !userType) return;

  switch (userType) {
    case AuthenticatedUserTypes.official:
      return await getAuthenticatedOfficial(userId);
    case AuthenticatedUserTypes.lobbyist:
      return await getAuthenticatedLobbyist(userId);
  }
}

async function getAuthenticatedOfficial(userId: string) {
  let filters = [
    eq(schema.officials.id, userId),
    eq(schema.officials.active, true)
  ];
  const user = await db
    .select({
      id: schema.officials.id,
      name: schema.officials.name,
    })
    .from(schema.officials)
    .where(and(...filters));

  if (user.length == 1) {
    const authenticatedUser = {
      id: user[0].id,
      name: user[0].name,
      type: AuthenticatedUserTypes.official,
    } as AuthenticatedUser;
    return authenticatedUser;
  } else {
    return;
  }
}

async function getAuthenticatedLobbyist(userId: string) {
  let filters = [
    eq(schema.lobbyists.id, userId),
    eq(schema.lobbyists.active, true)
  ];
  const user = await db
    .select({
      id: schema.lobbyists.id,
      name: schema.lobbyists.name,
    })
    .from(schema.lobbyists)
    .where(and(...filters));

  if (user.length == 1) {
    const authenticatedUser = {
      id: user[0].id,
      name: user[0].name,
      type: AuthenticatedUserTypes.lobbyist,
    } as AuthenticatedUser;
    return authenticatedUser;
  } else {
    return;
  }
}

export async function isPermitted(permission: PermissionTypes, user?: AuthenticatedUser, args: Record<string, string> = {}) {
  if (!user) return;

  switch (permission) {
    case PermissionTypes.addMeeting:
      return user.type == AuthenticatedUserTypes.official;
    case PermissionTypes.editOrganization:
      if (user.type != AuthenticatedUserTypes.lobbyist) return false;
      return await canEditOrganization(user, args["organizationId"]);
  }
}

async function canEditOrganization(user: AuthenticatedUser, organizationId: string) {
  // Check if member of same organization
  const filters = [
    eq(schema.lobbyists.id, user.id),
    eq(schema.lobbyists.organization_id, organizationId),
    eq(schema.lobbyists.active, true)
  ];
  const dbUser = await db
    .select({
      id: schema.lobbyists.id,
    })
    .from(schema.lobbyists)
    .where(and(...filters));
  return dbUser.length == 1;
} 

export async function loginUser(cookies: Cookies, userId: string, userType: AuthenticatedUserTypes) {
  console.log("Login successful for ", userId, userType);
  cookies.set(USER_ID_COOKIE, userId, {path: AUTHENTICATION_COOKIE_PATH});
  cookies.set(USER_TYPE_COOKIE, userType, {path: AUTHENTICATION_COOKIE_PATH});
}

export async function logoutUser(cookies: Cookies) {
  cookies.delete(USER_ID_COOKIE, {path: AUTHENTICATION_COOKIE_PATH});
}