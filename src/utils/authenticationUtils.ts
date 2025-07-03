import type { Cookies } from "@sveltejs/kit";
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { AuthenticatedUser } from "../types";

let USER_ID_COOKIE = 'userId';
let AUTHENTICATION_COOKIE_PATH = '/';

export async function getAuthenticatedUser(cookies: Cookies) {
  let userId = cookies.get(USER_ID_COOKIE);

  if (!userId) return;

  let filters = [
    eq(schema.officials.id, userId),
    eq(schema.officials.active, true)
  ];
  const user = await db
    .select({
      id: schema.officials.id,
      name: schema.officials.name,
      type: schema.officials.type
    })
    .from(schema.officials)
    .where(and(...filters));

  if (user.length == 1) {
    return user[0] as AuthenticatedUser
  } else {
    return;
  }
}

export async function loginUser(cookies: Cookies, userId: string) {
  console.log("Login successful for " + userId);
  cookies.set(USER_ID_COOKIE, userId, {path: AUTHENTICATION_COOKIE_PATH});
}

export async function logoutUser(cookies: Cookies) {
  cookies.delete(USER_ID_COOKIE, {path: AUTHENTICATION_COOKIE_PATH});
}