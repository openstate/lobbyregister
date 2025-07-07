import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async (event) => {
  let authenticatedUser = event.locals.user;
  return { authenticatedUser };
});