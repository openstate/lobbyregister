import type { Handle } from '@sveltejs/kit';
import { getAuthenticatedUser } from './utils/authenticationUtils';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = await getAuthenticatedUser(event.cookies);

  const response = await resolve(event);

  return response;
};