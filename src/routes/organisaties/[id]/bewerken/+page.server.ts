import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server'
import { zfd } from 'zod-form-data';
import { z } from 'zod/v4';
import nl from "zod/v4/locales/nl.js"
z.config(nl());
import { type Actions } from '@sveltejs/kit';
import { and, eq, ne, sql } from 'drizzle-orm';
import { ORGANIZATION_TYPES } from '$lib/constants';
import { alias } from 'drizzle-orm/pg-core';
import type { ObjectOption } from "svelte-multiselect";

import type { PageServerLoad } from './$types';
import { loadOrganizationData } from '../../utils';
import { PermissionTypes } from '../../../../types';
import { isPermitted } from '../../../../utils/authenticationUtils';
import { REDIRECTS } from '../../../../utils/routingUtils';

// TODO createOrganizationSchema, action 'default' and page.svelte is nearly identical
// to /organisaties/registreren -> refactor
const createOrganizationSchema = zfd.formData({
  name: zfd.text(z.string().trim()),
  kvk_number: zfd.text(z.string().optional()),
  no_kvk: zfd.checkbox(),
  city: zfd.text(z.string().trim()),
  website: zfd.text(z.string().trim()),
  sector: zfd.text(z.string().trim()),
  type: zfd.text(z.enum(ORGANIZATION_TYPES)),
  lobbyists: z.preprocess((value) => JSON.parse(value as string), z.array(z.record(z.string(), z.string()))),
  selected_clients: z.preprocess((value) => JSON.parse(value as string), z.array(z.object({value: z.string(), label: z.string()}))),
});

export const actions: Actions = {
  default: async ({ params, request, cookies }) => {
    const { id } = params;
    if (!id) throw new Error("id cannot be undefined")

    const parsed = createOrganizationSchema.safeParse(await request.formData());

    let formValid = parsed.success;
    let issues: string[] = [];

    let name, type, sector, kvk_number, no_kvk, city, website, is_commercial, lobbyists, selected_clients;
    if (!parsed.success) {
      issues = parsed.error.issues.map((issue) => `${String(issue.path[0])} - ${issue.message}`);
    } else {
      ({ name, type, sector, kvk_number, no_kvk, city, website, lobbyists, selected_clients } = parsed.data);
      // 03-07: decision was made to hide the is_commercial flag from the UI. Left it here so that
      // the DB did not have to be rebuilt
      is_commercial = type === 'consultant';      
      website = website.replace(/^https?:?\/?\/?/, '');

      if (no_kvk) {
        kvk_number = undefined;
      } else {
        formValid = new RegExp(/^\d{8}$/).test(kvk_number || '');
        if (!formValid) {
          issues.push(`kvk_number - moet een getal van 8 cijfers zijn`)            
        } else {
          // Check uniqueness KvK nummer. Exclude own record
          let filters = [
            eq(schema.organizations.kvk_number, kvk_number || ''),
            ne(schema.organizations.id, id),
          ]
          const kvkNumberExists = await db
            .select({exists: sql<number>`1`})
            .from(schema.organizations)
            .where(and(...filters));
          if (kvkNumberExists.length > 0) {
            issues.push(`kvk_number - er bestaat al een organisatie in het Lobbyregister met dit KvK nummber`)
            formValid = false;
          }
        }
      }

      if (formValid) {
        const [organization] = await db
          .update(schema.organizations)
          .set({ name, type, is_commercial, sector, kvk_number, city, website })
          .where(eq(schema.organizations.id, id))
          .returning();

        syncLobbyists(id, lobbyists);

        syncClients(id, selected_clients);

        const message = "Lobbyorganisatie is opgeslagen";
        return redirect(302, `/organisaties/${id}`, {type: 'success', message: message}, cookies);
      }
    }

    console.error('Validation error:', parsed.error);
    return fail(400, {
      message: 'Ongeldige gegevens:',
      issues: issues
    });
  }
};

const syncLobbyists = async(organizationId: string, lobbyists: Array<Record<string, string>>) => {
  // - lobbyist with 'id' -> Update in db
  // - lobbyist with blank 'id' -> Add to db
  // - existing lobbyists in db but not in lobbyists: delete (set active=false)
  const filters = [
    eq(schema.lobbyists.active, true),
    eq(schema.lobbyists.organization_id, organizationId)
  ];
  const existingIds = (await db
    .select({
      id: schema.lobbyists.id,
    })
    .from(schema.lobbyists)
    .where(and(...filters))
  ).map((row) => row['id']);
  const keptIds = lobbyists.map((lobbyist) => lobbyist.id).filter((lobbyistId) => !!lobbyistId);
  const idsToRemove = existingIds.filter((lobbyistId) => !keptIds.includes(lobbyistId));
  
  for (let lobbyist of lobbyists) {
    if (lobbyist.id) {
      await db
        .update(schema.lobbyists)
        .set({ name: lobbyist.name, function: lobbyist.function })
        .where(eq(schema.lobbyists.id, lobbyist.id));
    } else {
      await db
        .insert(schema.lobbyists)
        .values({ name: lobbyist.name, function: lobbyist.function, organization_id: organizationId});
    }
  }

  for (let lobbyistId of idsToRemove) {
    await db
      .update(schema.lobbyists)
      .set({ active: false })
      .where(eq(schema.lobbyists.id, lobbyistId));
  }
}

const syncClients = async(organizationId: string, selectedClients: ObjectOption[]) => {
  // - existing clients in selectedClients but not in db: add to organization_representatives (or set active=true)
  // - existing clients in db but not in selectedClients: delete from organization_representatives (set active=false)
  const existingClients = await db
    .select({
      id: schema.organization_representatives.id,
      client_id: schema.organization_representatives.client_id,
      active: schema.organization_representatives.active,
    })
    .from(schema.organization_representatives)
    .where(eq(schema.organization_representatives.representative_id, organizationId));

  const existingActiveClients = existingClients.filter((client) => client.active);
  const existingInActiveClients = existingClients.filter((client) => !client.active);
  const selectedClientIds = selectedClients.map((client) => client.value as string);

  for (let clientId of selectedClientIds) {
    let existingActive = existingActiveClients.filter((client) => client.client_id == clientId);
    if (existingActive.length > 0){
      // OK, nothing to do
      continue;
    }

    let existingInActive = existingInActiveClients.filter((client) => client.client_id == clientId);
    if (existingInActive.length > 0){
      // set active to true
      await db
        .update(schema.organization_representatives)
        .set({active: true})
        .where(eq(schema.organization_representatives.id, existingInActive[0].id));
      continue;  
    }

    // Not in db yet, so add to db
    await db
      .insert(schema.organization_representatives)
      .values({ representative_id: organizationId, client_id: clientId});    
  }

  for (let client of existingActiveClients) {
    if (!selectedClientIds.includes(client.client_id)) {
      // set active to false
      await db
        .update(schema.organization_representatives)
        .set({active: false})
        .where(eq(schema.organization_representatives.id, client.id));
    }
  }
}

export const load: PageServerLoad = async (event) => {
  const { id } = event.params;
  // Check authorization
  if (!await isPermitted(PermissionTypes.editOrganization, event.locals.user, {"organizationId": id})) {
    if (event.locals.user) {
        const message = "Om deze lobbyorganisatie te bewerken moet u ingelogd zijn als een lobbyist van de organisatie";
        return redirect(302, `/organisaties/${id}`, {type: 'error', message: message}, event.cookies);
    } else {
      redirect(302, `/inloggen_lobbyist?fromPage=${REDIRECTS.edit_organization}&fromPageParams={"organizationId": "${id}"}`);
    }
  }

  const {
    organization,
    lobbyists,
    clientOrganizations,
  } = await loadOrganizationData(id);

  const selectedClients = clientOrganizations.map((organization) => {return {
    label: organization.client_name,
    value: organization.client_id
  }});

  const client_organizations = alias(schema.organizations, 'client_organizations');
  const allClientOrganizations = await db
    .select({
      client_id: client_organizations.id,
      client_name: client_organizations.name,
      client_sector: client_organizations.sector,
    })
    .from(client_organizations)
    .where(eq(client_organizations.active, true));
  const allClientOrganizationLabels = allClientOrganizations.map((organization) => {return {
    label: organization.client_name,
    value: organization.client_id,
  }});

  return {
    organization,
    lobbyists,
    allClientOrganizationLabels,
    selectedClients,
  };
};