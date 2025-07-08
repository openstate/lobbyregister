export enum REDIRECTS {
  add_meeting='add_meeting',
  edit_organization='edit_organization',
}

export const redirectPath = (fromPage?: REDIRECTS, fromPageParams?: Record<string, string>) => {
  if (!fromPage) return '/';

  switch(fromPage) {
    case REDIRECTS.add_meeting:
      return '/afspraken/toevoegen';
    case REDIRECTS.edit_organization:
      const id = (fromPageParams || {})["organizationId"];
      return `/organisaties/${id}/bewerken`;
  }
}
