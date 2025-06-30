export const ORGANIZATION_TYPES = ['inhouse', 'consultant', 'association'] as const;

export enum MEETING_TYPES {in_person='in_person', phone_call='phone_call', video_call='video_call'};

export const OFFICIAL_TYPES = [
  'minister',
  'state_secretary',
  'secretary_general',
  'director_general',
  'political_assistant',
] as const;

export const SBI_CODES = new Map([
  ['A', 'Landbouw, bosbouw en visserij'],
  ['B', 'Winning van delfstoffen'],
  ['C', 'Industrie'],
  ['D', 'Productie en distributie van en handel in elektriciteit, gas, stoom en gekoelde lucht'],
  ['E', 'Winning en distributie van water; afval- en afvalwaterbeheer en sanering'],
  ['F', 'Bouwnijverheid'],
  ['G', 'Groot- en detailhandel'],
  ['H', 'Vervoer en opslag'],
  ['I', 'Logies-, maaltijd- en drankverstrekking'],
  [
    'J',
    'Activiteiten van uitgeverijen, omroepactiviteiten, en activiteiten op het gebied van productie en distributie van inhoud ',
  ],
  [
    'K',
    'Telecommunicatie, computerprogrammering en consultancy, informatica-infrastructuur en overige activiteiten op het gebied van informatiediensten',
  ],
  ['L', 'Activiteiten op het gebied van financiële dienstverlening en verzekeringen'],
  ['M', 'Exploitatie van en handel in onroerend goed'],
  [
    'N',
    'Wetenschappelijke en technische activiteiten en specialistische zakelijke dienstverlening',
  ],
  ['O', 'Verhuur van roerende goederen en overige zakelijke dienstverlening'],
  ['P', 'Openbaar bestuur, overheidsdiensten en verplichte sociale verzekeringen'],
  ['Q', 'Onderwijs'],
  ['R', 'Gezondheids- en welzijnszorg'],
  ['S', 'Kunst, cultuur, sport en recreatie activiteiten'],
  ['T', 'Overige dienstverlening'],
  [
    'U',
    'Activiteiten van huishoudens als werkgever en niet-gedifferentieerde productie van goederen en diensten door huishoudens voor eigen gebruik',
  ],
  ['V', 'Activiteiten van extraterritoriale organisaties en instanties'],
]);

export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}
