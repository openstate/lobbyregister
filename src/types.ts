import type { MEETING_TYPES, OFFICIAL_TYPES } from '$lib/constants';

export type Meeting = { id: string; date: string; description: string; departments: string[] };

export type Official = { id: string; name: string; type: string };

export type Lobbyist = { id: string; name: string; function: string };

export enum AuthenticatedUserTypes {
  official = 'official',
  lobbyist = 'lobbyist',
}
export type AuthenticatedUser = { id: string; name: string; type: AuthenticatedUserTypes };

export enum PermissionTypes {
  addMeeting = 'addMeeting',
  editOrganization = 'editOrganization',
}

export const LOBBY_TYPES = [
  {
    id: 'inhouse',
    label: 'Belangen van eigen organisatie - bedrijf/onderneming',
    description: 'Bedrijven en ondernemingen.',
  },
  {
    id: 'inhouse_ngo',
    label: 'Belangen van eigen organisatie - maatschappelijke organisatie (NGO)',
    description: 'Maatschappelijke organisaties.',
  },
  {
    id: 'association',
    label: 'Belangen van sector of branche',
    description: 'Bijvoorbeeld brancheverenigingen of koepelorganisaties.',
  },
  {
    id: 'consultant',
    label: 'Belangen van cliënten',
    description: 'Bijvoorbeeld externe lobbybureaus.',
  },
] as const;

export const organizationTypeLabels = {
  inhouse: 'Belangen van eigen organisatie - bedrijf/onderneming',
  inhouse_ngo: 'Belangen van eigen organisatie - maatschappelijke organisatie (NGO)',
  consultant: 'Belangen van cliënten',
  association: 'Belangen van sector of branche',
};

export enum searchCategoryTypes {
  searchMeetingsId = 'searchMeetingsId',
  searchOrganizationsId = 'searchOrganizationsId',
  searchLobbyistsId = 'searchLobbyistsId',
}
export const searchCategoryTexts: Record<keyof typeof searchCategoryTypes, string> = {
  searchMeetingsId: 'Onderwerpen',
  searchOrganizationsId: 'Lobbyorganisaties',
  searchLobbyistsId: 'Namen lobbyisten',
};

export const meetingTypeLabels: Record<keyof typeof MEETING_TYPES, string> = {
  in_person: 'Fysiek gesprek',
  phone_call: 'Telefoongesprek',
  video_call: 'Videogesprek',
  working_visit: 'Werkbezoek',
  other_external: 'Andere externe activiteit (bv congres, beurs)',
};

export const officialTypeLabels: Record<(typeof OFFICIAL_TYPES)[number], string> = {
  mayor: 'Burgemeester',
  alderman: 'Wethouder',
  municipal_secretary: 'Gemeentesecretaris',
  director: 'Directeur',
  political_assistant: 'Politiek assistent',
};

export const policyAreaLabels = [
  'Volksgezondheid',
  'Wonen',
  'Migratie',
  'Justitie',
  'Economie',
  'Openbaar bestuur',
  'Milieu, klimaat en natuur',
  'Digitalisering',
  'Werkgelegenheid',
  'Sport',
  'Welzijn',
  'Onderwijs',
  'Infrastructuur',
  'Cultuur',
  'Financiën, belastingen en toeslagen',
  'Mobiliteit'
];
