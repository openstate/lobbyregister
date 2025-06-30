import type { MEETING_TYPES } from "$lib/constants";

export type Meeting = { id: string; date: string; description: string; departments: string[] };

export type Official = { id: string, name: string, type: string };

export const meetingTypeLabels: Record<keyof typeof MEETING_TYPES, string> = {
  in_person: 'Fysiek gesprek',
  phone_call: 'Telefoongesprek',
  video_call: 'Videogesprek',
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
  'Economische Zaken',
  'Klimaat en Groene Groei',
  'Sociale Zaken en Werkgelegenheid',
  'Volksgezondheid, Welzijn en Sport',
  'Infrastructuur en Waterstaat',
  'Justitie en Veiligheid',
];