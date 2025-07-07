import type { PageServerLoad } from './$types';
import { loadOrganizationData } from '../utils';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const {
    organization,
    lobbyists,
    clientOrganizations,
    representativeOrganizations,
  } = await loadOrganizationData(id);

  return {
    organization,
    lobbyists,
    clientOrganizations,
    representativeOrganizations,
  };
};
