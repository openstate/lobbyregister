import type { MEETING_TYPES } from "$lib/constants";

export type Meeting = { id: string; date: string; description: string; departments: string[] };

export type Official = { id: string, name: string, type: string };

export type AuthenticatedUser = { id: string, name: string, type: string };

export enum searchCategoryTypes {
  searchMeetingsId='searchMeetingsId',
  searchOrganizationsId='searchOrganizationsId',
  searchLobbyistsId='searchLobbyistsId'
}
export const searchCategoryTexts: Record<keyof typeof searchCategoryTypes, string> = {
  searchMeetingsId: "Onderwerpen",
  searchOrganizationsId: "Namen organisaties",
  searchLobbyistsId: "Namen lobbyisten"
}

export const meetingTypeLabels: Record<keyof typeof MEETING_TYPES, string> = {
  in_person: 'Fysiek gesprek',
  phone_call: 'Telefoongesprek',
  video_call: 'Videogesprek',
  working_visit: 'Werkbezoek',
  other_external: 'Andere externe activiteit (bv congres, beurs)'
};

export const officialTypeLabels: Record<string, string> = {
  minister: 'Minister',
  state_secretary: 'Staatssecretaris',
  secretary_general: 'Secretaris-generaal',
  director_general: 'Directeur-generaal',
  political_assistant: 'Politiek assistent',
};

export const organizationTypeLabels = {
  inhouse: 'Belangen van eigen organisatie',
  consultant: 'Belangen van cliënten',
  association: 'Belangen van sector of branche',
};

export const policyAreaLabels = [
  'volksgezondheid',
  'wonen',
  'migratie',
  'justitie',
  'economie',
  'openbaar bestuur',
  'milieu/klimaat/natuur',
  'buitenlandse zaken',
  'defensie',
  'digitalisering',
  'sociale zaken & werkgelegenheid',
  'sport',
  'welzijn',
  'onderwijs',
  'infrastructuur',
  'landbouw',
  'cultuur',
  'financiën & belastingen/toeslagen',
];