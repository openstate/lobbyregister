import type { Handle } from '@sveltejs/kit';
import { getAuthenticatedUser } from './utils/authenticationUtils';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

function checkBasicAuth() {
  const authorization = getRequestEvent().request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Basic ')) return false;
  const credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf-8');
  return credentials === `${env.BASIC_AUTH_USERNAME}:${env.BASIC_AUTH_PASSWORD}`;
}

export const handle: Handle = async ({ event, resolve }) => {
  // Gatekeeping authentication for the full demo
  if (!checkBasicAuth())
    return new Response('Unauthorized', {
      headers: { 'WWW-Authenticate': 'Basic realm="lobbyregister"' },
      status: 401,
    });

  // In-app authentication for lobbyists and government officials
  event.locals.user = await getAuthenticatedUser(event.cookies);

  return resolve(event);
};
