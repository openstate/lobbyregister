import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( event ) => {
  let authenticatedUser = event.locals.user;
  return { authenticatedUser };
};