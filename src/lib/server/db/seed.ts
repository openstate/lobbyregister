import { fakerNL as faker } from '@faker-js/faker';
import * as schema from './schema.ts';
import { db } from './index.ts';
import { ORGANIZATION_TYPES, MEETING_TYPES, SBI_CODES } from '../../constants.ts';
import { policyAreaLabels } from '../../../types.ts';

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Calculate relative dates based on current date
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const fourYearsAgo = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());

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
        { weight: 2, value: 'inhouse_ngo' },
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
          .between({ from: oneYearAgo, to: today })
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

    // Add exactly 1 mayor
    officials.push({
      name: faker.person.fullName(),
      type: 'mayor' as const,
      department: 'College van Burgemeester en Wethouders',
      active: true,
      registered_at: faker.date
        .between({ from: oneYearAgo, to: today })
        .toISOString()
        .split('T')[0],
    });
    console.log(`👑 Seeded mayor: ${officials[0].name}`);

    for (let i = 0; i < 9; i++) {
      officials.push({
        name: faker.person.fullName(),
        type: 'alderman' as const,
        department: 'College van Burgemeester en Wethouders',
        active: true,
        registered_at: faker.date
          .between({ from: oneYearAgo, to: today })
          .toISOString()
          .split('T')[0],
      });
    }

    officials.push({
      name: faker.person.fullName(),
      type: 'municipal_secretary' as const,
      department: 'Gemeentelijk Management Team',
      active: true,
      registered_at: faker.date
        .between({ from: oneYearAgo, to: today })
        .toISOString()
        .split('T')[0],
    });

    for (let i = 0; i < 10; i++) {
      const official = {
        name: faker.person.fullName(),
        type: 'political_assistant' as const,
        department: 'College van Burgemeester en Wethouders',
        active: faker.datatype.boolean(0.95),
        registered_at: faker.date
          .between({ from: oneYearAgo, to: today })
          .toISOString()
          .split('T')[0],
      };

      officials.push(official);
    }

    for (let i = 0; i < 10; i++) {
      const official = {
        name: faker.person.fullName(),
        type: 'director' as const,
        department: 'Gemeentelijk Management Team',
        active: faker.datatype.boolean(0.95),
        registered_at: faker.date
          .between({ from: oneYearAgo, to: today })
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
            .between({ from: fourYearsAgo, to: today })
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
            .between({ from: fourYearsAgo, to: today })
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
      const type = faker.helpers.arrayElement(Object.keys(MEETING_TYPES)) as MEETING_TYPES;
      const meetingDate = faker.date.between({ from: oneYearAgo, to: today });

      // Calculate registered_at as 1-7 days after the meeting date
      const registeredAt = new Date(meetingDate);
      registeredAt.setDate(registeredAt.getDate() + faker.number.int({ min: 1, max: 7 }));

      const meeting = {
        type: type,
        date: meetingDate.toISOString(),
        description: generateDutchMeetingDescription(),
        location:
          type === MEETING_TYPES.in_person
            ? generateCityLocation()
            : type === MEETING_TYPES.other_external
              ? generateConferenceLocation()
              : type === MEETING_TYPES.working_visit
                ? generateWerkbezoekLocation()
                : null,
        policy_areas: faker.helpers.arrayElements(policyAreaLabels, { min: 1, max: 3 }),
        contact_name: faker.person.fullName(),
        contact_method: faker.phone.number({ style: 'human' }),
        registered_at: registeredAt.toISOString().split('T')[0],
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
    case 'inhouse_ngo':
      return faker.company.name();
    default:
      return faker.company.name();
  }
}

function generateDutchSector(): string {
  return faker.helpers.arrayElement(Array.from(SBI_CODES.keys()));
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

function generateCityLocation(): string {
  return faker.helpers.weightedArrayElement([
    { weight: 8, value: 'Stadhuis, Den Haag' },
    { weight: 2, value: 'Provinciehuis Zuid-Holland, Den Haag' },
    { weight: 1, value: 'Ministerie van Binnenlandse Zaken, Den Haag' },
  ]);
}

function generateConferenceLocation(): string {
  return faker.helpers.weightedArrayElement([
    { weight: 1, value: 'Nieuwspoort, Den Haag' },
    { weight: 1, value: 'Centraal Station, Den Haag' },
    { weight: 1, value: 'WTC The Hague, Den Haag' },
    { weight: 1, value: 'Beatrixgebouw, Den Haag' },
  ]);
}

function generateWerkbezoekLocation(): string {
  return faker.helpers.weightedArrayElement([
    { weight: 3, value: 'Haagse Hogeschool, Den Haag' },
    { weight: 3, value: 'Mauritshuis, Den Haag' },
    { weight: 2, value: 'Scheveningen Haven, Den Haag' },
    { weight: 2, value: 'Binckhorst bedrijventerrein, Den Haag' },
    { weight: 2, value: 'Den Haag Zuidwest wijkcentrum' },
    { weight: 2, value: 'Kunstmuseum Den Haag' },
    { weight: 2, value: 'Sportcampus Zuiderpark, Den Haag' },
    { weight: 1, value: 'Technologiepark Ypenburg, Den Haag' },
    { weight: 1, value: 'De Haagse Markt' },
    { weight: 1, value: 'Strandpaviljoen Scheveningen' },
    { weight: 1, value: 'Startup incubator Apollo 14, Den Haag' },
    { weight: 1, value: 'ROC Mondriaan, Den Haag' },
    { weight: 1, value: 'Stichting PEP, Den Haag' },
    { weight: 1, value: 'Den Haag International Centre' },
  ]);
}

function generateDutchCity(): string {
  return faker.helpers.weightedArrayElement([
    { weight: 8, value: 'Den Haag' },
    { weight: 1, value: 'Delft' },
    { weight: 1, value: 'Leiden' },
    { weight: 1, value: 'Rijswijk' },
    { weight: 1, value: 'Zoetermeer' },
    { weight: 1, value: 'Pijnacker-Nootdorp' },
    { weight: 1, value: 'Wassenaar' },
  ]);
}

function websiteFromName(name: string) {
  const domain = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[,]/g, '')
    .replace(/-+/g, '-')
    .replace(/\.+/g, '.')
    .replace(/\.$/, '');
  return 'www.' + domain + '.nl';
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
