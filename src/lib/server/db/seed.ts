import { fakerNL as faker } from '@faker-js/faker';
import * as schema from './schema.ts';
import { db } from './index.ts';
import { ORGANIZATION_TYPES, MEETING_TYPES, OFFICIAL_TYPES, SBI_CODES } from '../../constants.ts';
import { policyAreaLabels } from '../../../types.ts';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await db.delete(schema.meeting_representatives);
    await db.delete(schema.meeting_lobbyists);
    await db.delete(schema.meeting_officials);
    await db.delete(schema.meetings);
    await db.delete(schema.lobbyists);
    await db.delete(schema.organization_representatives);
    await db.delete(schema.officials);
    await db.delete(schema.organizations);

    // Seed Organizations
    console.log('🏢 Seeding organizations...');
    const organizations = [];
    for (let i = 0; i < 50; i++) {
      const orgType = faker.helpers.weightedArrayElement([
        { weight: 5, value: 'inhouse' },
        { weight: 1, value: 'consultant' },
        { weight: 2, value: 'association' },
      ]);
      const isCommercial = orgType === 'consultant' || faker.datatype.boolean(0.7);

      const organizationName = generateDutchOrganizationName(orgType);
      const organization = {
        name: organizationName,
        type: orgType,
        kvk_number: faker.datatype.boolean(0.95)
          ? faker.number.int({ min: 10000000, max: 99999999 }).toString()
          : null,
        city: generateDutchCity(),
        website: websiteFromName(organizationName),
        is_commercial: isCommercial,
        sector: generateDutchSector(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        active: faker.datatype.boolean(0.95),
        registered_at: faker.date
          .between({ from: '2024-01-01', to: '2025-06-30' })
          .toISOString()
          .split('T')[0],
      };

      organizations.push(organization);
    }

    const insertedOrganizations = await db
      .insert(schema.organizations)
      .values(organizations)
      .returning();
    console.log(`✅ Inserted ${insertedOrganizations.length} organizations`);

    // Seed Officials
    console.log('👔 Seeding officials...');
    const officials = [];
    for (let i = 0; i < 30; i++) {
      const official = {
        name: faker.person.fullName(),
        type: faker.helpers.arrayElement(OFFICIAL_TYPES),
        department: generateDutchDepartment(),
        active: faker.datatype.boolean(0.95),
        registered_at: faker.date
          .between({ from: '2024-01-01', to: '2025-06-30' })
          .toISOString()
          .split('T')[0],
      };

      officials.push(official);
    }

    const insertedOfficials = await db.insert(schema.officials).values(officials).returning();
    console.log(`✅ Inserted ${insertedOfficials.length} officials`);

    // Seed Organization Representatives
    console.log('🤝 Seeding organization representatives...');
    const representatives = [];
    for (let i = 0; i < 25; i++) {
      const representative = faker.helpers.arrayElement(
        insertedOrganizations.filter((org) => org.type === 'consultant'),
      );
      const client = faker.helpers.arrayElement(
        insertedOrganizations.filter((org) => org.type !== 'consultant'),
      );

      if (representative.id !== client.id) {
        representatives.push({
          representative_id: representative.id,
          client_id: client.id,
          active: faker.datatype.boolean(0.95),
          registered_at: faker.date
            .between({ from: '2021-01-01', to: '2025-06-30' })
            .toISOString()
            .split('T')[0],
        });
      }
    }

    const insertedRepresentatives = await db
      .insert(schema.organization_representatives)
      .values(representatives)
      .returning();
    console.log(`✅ Inserted ${insertedRepresentatives.length} organization representatives`);

    // Seed Lobbyists
    console.log('👥 Seeding lobbyists...');
    const lobbyists = [];
    for (const org of insertedOrganizations) {
      const numLobbyists = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < numLobbyists; i++) {
        const lobbyist = {
          organization_id: org.id,
          name: faker.person.fullName(),
          function: generateDutchJobTitle(),
          active: faker.datatype.boolean(0.95),
          registered_at: faker.date
            .between({ from: '2021-01-01', to: '2025-06-30' })
            .toISOString()
            .split('T')[0],
        };

        lobbyists.push(lobbyist);
      }
    }

    const insertedLobbyists = await db.insert(schema.lobbyists).values(lobbyists).returning();
    console.log(`✅ Inserted ${insertedLobbyists.length} lobbyists`);

    // Seed Meetings
    console.log('📅 Seeding meetings...');
    const meetings = [];
    for (let i = 0; i < 100; i++) {
      const type = faker.helpers.arrayElement(Object.keys(MEETING_TYPES));
      const meeting = {
        type: type as MEETING_TYPES,
        date: faker.date.between({ from: '2024-01-01', to: '2025-06-01' }).toISOString(),
        description: generateDutchMeetingDescription(),
        location: type === 'in_person' ? generateDutchLocation() : null,
        policy_areas: faker.helpers.arrayElements(
          policyAreaLabels,
          { min: 1, max: 3 },
        ),
        contact_name: faker.person.fullName(),
        contact_method: faker.phone.number({style: 'human'}),
        registered_at: faker.date
          .between({ from: '2024-01-01', to: '2025-06-01' })
          .toISOString()
          .split('T')[0],
      };

      meetings.push(meeting);
    }

    const insertedMeetings = await db.insert(schema.meetings).values(meetings).returning();
    console.log(`✅ Inserted ${insertedMeetings.length} meetings`);

    // Seed Meeting Officials
    console.log('👔📅 Linking meetings with officials...');
    const meetingOfficials = [];
    for (const meeting of insertedMeetings) {
      const numOfficials = faker.number.int({ min: 1, max: 2 });
      const selectedOfficials = faker.helpers.arrayElements(insertedOfficials, numOfficials);

      for (const official of selectedOfficials) {
        meetingOfficials.push({
          meeting_id: meeting.id,
          official_id: official.id,
        });
      }
    }

    await db.insert(schema.meeting_officials).values(meetingOfficials);
    console.log(`✅ Linked ${meetingOfficials.length} meeting-official relationships`);

    // Seed Meeting Lobbyists
    console.log('👥📅 Linking meetings with lobbyists...');
    const meetingLobbyists = [];
    for (const meeting of insertedMeetings) {
      const numLobbyists = faker.number.int({ min: 1, max: 4 });
      const selectedLobbyists = faker.helpers.arrayElements(insertedLobbyists, numLobbyists);

      for (const lobbyist of selectedLobbyists) {
        meetingLobbyists.push({
          meeting_id: meeting.id,
          lobbyist_id: lobbyist.id,
        });
      }
    }

    const insertedMeetingLobbyists = await db
      .insert(schema.meeting_lobbyists)
      .values(meetingLobbyists)
      .returning();
    console.log(`✅ Linked ${insertedMeetingLobbyists.length} meeting-lobbyist relationships`);

    // Seed Meeting Representatives
    console.log('🤝📅 Linking meeting lobbyists with representatives...');
    const meetingRepresentatives = [];
    for (const meetingLobbyist of insertedMeetingLobbyists) {
      const lobbyist = insertedLobbyists.find((l) => l.id === meetingLobbyist.lobbyist_id);
      if (!lobbyist) continue;
      const validRepresentatives = insertedRepresentatives.filter(
        (r) => r.representative_id === lobbyist.organization_id,
      );
      if (validRepresentatives.length > 0) {
        const numRepresentations = faker.number.int({
          min: 1,
          max: Math.min(3, validRepresentatives.length),
        });
        const selectedRepresentatives = faker.helpers.arrayElements(
          validRepresentatives,
          numRepresentations,
        );

        for (const representative of selectedRepresentatives) {
          meetingRepresentatives.push({
            meeting_lobbyist_id: meetingLobbyist.id,
            representation_id: representative.id,
          });
        }
      }
    }

    if (meetingRepresentatives.length > 0) {
      await db.insert(schema.meeting_representatives).values(meetingRepresentatives);
      console.log(
        `✅ Linked ${meetingRepresentatives.length} meeting representative relationships`,
      );
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateDutchOrganizationName(type: (typeof ORGANIZATION_TYPES)[number]): string {
  const companyTypes = ['B.V.', 'N.V.', 'Holding', 'Group'];
  const consultingNames = ['Consultancy', 'Advies', 'Partners', 'Consultants', 'Strategy'];
  const associationNames = ['Vereniging', 'Bond', 'Organisatie', 'Federatie', 'Unie'];

  switch (type) {
    case 'consultant':
      return `${faker.company.name()} ${faker.helpers.arrayElement(consultingNames)}`;
    case 'association':
      return `${capitalizeFirstLetter(faker.company.buzzNoun())} ${faker.helpers.arrayElement(associationNames)}`;
    case 'inhouse':
      return `${faker.company.name()} ${faker.helpers.arrayElement(companyTypes)}`;
    default:
      return faker.company.name();
  }
}

function generateDutchSector(): string {
  return faker.helpers.arrayElement(Array.from(SBI_CODES.keys()));
}

function generateDutchDepartment(): string {
  const departments = [
    'Ministerie van Algemene Zaken',
    'Ministerie van Binnenlandse Zaken en Koninkrijksrelaties',
    'Ministerie van Buitenlandse Zaken',
    'Ministerie van Defensie',
    'Ministerie van Economische Zaken en Klimaat',
    'Ministerie van Financiën',
    'Ministerie van Infrastructuur en Waterstaat',
    'Ministerie van Justitie en Veiligheid',
    'Ministerie van Landbouw, Natuur en Voedselkwaliteit',
    'Ministerie van Onderwijs, Cultuur en Wetenschap',
    'Ministerie van Sociale Zaken en Werkgelegenheid',
    'Ministerie van Volksgezondheid, Welzijn en Sport',
  ];

  return faker.helpers.arrayElement(departments);
}

function generateDutchJobTitle(): string {
  const titles = [
    'Senior Beleidsadviseur',
    'Directeur Public Affairs',
    'Lobbyist',
    'Strategisch Adviseur',
    'Senior Consultant',
    'Partner',
    'Managing Director',
    'Hoofd Government Relations',
    'Beleidsmedewerker',
    'Senior Manager',
    'Directeur',
    'Coördinator',
    'Specialist',
    'Adviseur',
    'Secretaris-generaal',
    'Plaatsvervangend directeur',
  ];

  return faker.helpers.arrayElement(titles);
}

function generateDutchMeetingDescription(): string {
  const topics = [
    'duurzaamheidsbeleid',
    'energietransitie',
    'digitalisering',
    'arbeidsmarkt',
    'klimaatmaatregelen',
    'innovatie',
    'regelgeving',
    'fiscaal beleid',
    'infrastructuur',
    'gezondheidszorg',
    'onderwijs',
    'woningmarkt',
    'internationale handel',
    'cybersecurity',
    'mobiliteit',
    'circulaire economie',
    'AI-ontwikkelingen',
    'pensioenen',
    'sociale zekerheid',
    'milieuwetgeving',
  ];

  const actions = [
    'Bespreking van voorstellen betreffende',
    'Consultatie over',
    'Informatieve bijeenkomst over',
    'Strategisch overleg aangaande',
    'Evaluatie van',
    'Toelichting op',
    'Brainstormsessie over',
    'Presentatie van',
    'Discussie betreffende',
    'Adviesgesprek over',
  ];

  return `${faker.helpers.arrayElement(actions)} ${faker.helpers.arrayElement(topics)}`;
}

function generateDutchLocation(): string {
  const locations = [
    'Ministerie, Den Haag',
    'Tweede Kamer, Den Haag',
    'Binnenhof, Den Haag',
    'Restaurant De Haagse Bos, Den Haag',
    'Hotel Des Indes, Den Haag',
    'Kurhaus, Scheveningen',
    'Amsterdam',
    'Rotterdam',
    'Utrecht',
  ];

  return faker.helpers.arrayElement(locations);
}

function generateDutchCity(): string {
  const cities = [
    'Den Haag',
    'Amsterdam',
    'Rotterdam',
    'Leiden',
    'Utrecht',
    'Groningen',
    'Alkmaar',
    'Maastricht',
    'Zwolle',
    'Den Bosch',
    'Leeuwarden',
    'Assen',
    'Lelystad',
    'Almere',
    'Vlissingen',
    'Den Helder',
    'Apeldoorn',
    'Amersfoort',
  ];

  return faker.helpers.arrayElement(cities);
}

function websiteFromName(name: string) {
  const domain = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[,]/g, "")
    .replace(/-+/g, '-')
    .replace(/\.+/g, '.')
    .replace(/\.$/, '');
  return "www." + domain + ".nl";
}

// Run the seed function
seed()
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
