<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
	import { DateInput } from 'date-picker-svelte'
  import MultiSelect from 'svelte-multiselect'  
  import type { Option } from "svelte-multiselect";
  import Consultant from '$lib/components/Consultant.svelte';

  const { data, form } = $props();
  let date = $state(new Date());
  let selectedOfficials = $state([]);
  let selectedLobbyists = $state([]);
  let selectedPolicyAreas = $state([]);

  let allSelectedClientsVar: { [key: string]: Option[]} = Object.assign({}, ...Object.entries(data.allRepresentativeNames).map((x) => ({[x[0]]: []})));
  
  let allSelectedClients = $state(allSelectedClientsVar);
  $inspect(allSelectedClients);
  let consultantIds = $state.raw(new Array<string>()); // Keeps track of selected lobbyists for consultant organizations

  function lobbyistAdded(event: CustomEvent) {
    let lobbyistId = event.detail.option.value as string;
    if (lobbyistId in data.consultantsToOrganizations){
      let consultantId = data.consultantsToOrganizations[lobbyistId];
      if (!(consultantIds.includes(consultantId))){
        consultantIds = [...consultantIds, consultantId];
      }
    }
  };

  function lobbyistRemoved(event: CustomEvent) {
    let lobbyistId = event.detail.option.value as string;
    if (lobbyistId in data.consultantsToOrganizations){
      let consultantId = data.consultantsToOrganizations[lobbyistId];
      // Remove consultantId but only if not referred to by other lobbyist
      let consultantIdsForSelectedLobbyists = selectedLobbyists.map((lobbyist) => {
        let lobbyistId = lobbyist.value;
        if (lobbyistId in data.consultantsToOrganizations){
          return data.consultantsToOrganizations[lobbyistId];
        }
      });
      if (!consultantIdsForSelectedLobbyists.includes(consultantId)) {
        const index = consultantIds.indexOf(consultantId, 0);
        if (index > -1) {
          consultantIds.splice(index, 1);
          consultantIds = [...consultantIds];
        }
      }
    }
  };

  function enHanceForm(formData: FormData) {
    formData.append('meeting_date', date.toISOString());
    formData.append('selected_officials', JSON.stringify(selectedOfficials.map((official) => official.value)));
    formData.append('selected_lobbyists', JSON.stringify(selectedLobbyists.map((lobbyist) => lobbyist.value)));
    let selectedClients: { [key: string]: Option[] } = Object.fromEntries(
      Object.entries($state.snapshot(allSelectedClients)).filter(([key, value]) => consultantIds.includes(key)));
    formData.append('selected_clients', JSON.stringify(selectedClients));
    formData.append('policy_areas', JSON.stringify(selectedPolicyAreas.map((spa) => spa.value)));    
  }
</script>

<div class="flex flex-wrap gap-x-16 gap-y-4 justify-between items-start mb-8">
  <h1 class="text-3xl font-semibold text-gray-800 mb-3 max-w-5xl line-clamp-1">Afspraak toevoegen</h1>
  <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
    <button
      onclick={() => (history.length > 1 ? history.back() : goto('/'))}
      class="text-gov-blue hover:text-gov-dark-blue hover:underline text-lg my-1 cursor-pointer"
    >
      ← Terug naar overzicht
    </button>
  </div>
</div>

{#if form?.message}
  <div class="mb-6 p-4 bg-red-100 text-red-700 border border-red-200">
    {form.message}
    <ul>
      {#each form?.issues as issue}
        <li class="pl-4">- {issue}</li>
      {/each}
    </ul>
  </div>
{/if}

<form method="POST" use:enhance={({formData}) => enHanceForm(formData)}>
  <!-- Primary Details -->
  <div class="lg:col-span-2 grid gap-8">
    <!-- Basic Information -->
    <div class="@container">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Informatie</h2>

      <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
        <div class="@lg:col-span-2">
          <label for="description" class="block text-base font-medium text-gray-800 mb-2">
            Onderwerp en toelichting
          </label>
          <textarea
            name="description"
            id="description"
            required
            rows=3
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Onderwerp en toelichting van afspraak"
          ></textarea>
        </div>
        <div class="@lg:col-span-2">
          <label for="policy_areas" class="block text-base font-medium text-gray-800 mb-2">
            Beleidsgebieden
          </label>
          <MultiSelect bind:selected={selectedPolicyAreas} options={data.allPolicyAreaOptions}
          placeholder="Selecteer 1 of meerdere beleidsgebieden" required />
        </div>
        <div class="">
          <label for="meeting_type" class="block text-base font-medium text-gray-800 mb-2">
            Type afspraak
          </label>
          <select
            name="meeting_type"
            id="meeting_type"
            required
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
          >
            <option value="">Selecteer type afspraak...</option>
            {#each data.meetingTypes as meetingType}
              <option value={meetingType[0]}>{meetingType[1]}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="meeting_location" class="block text-base font-medium text-gray-800 mb-2">
            Locatie
          </label>
          <input
            type="text"
            name="meeting_location"
            id="meeting_location"
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Bv Tweede Kamer, Den Haag"
          />
        </div>
        <div>
          <label for="meeting_date" class="block text-base font-medium text-gray-800 mb-2">
            Datum
          </label>
          <DateInput bind:value={date} format="dd-MM-yyyy" required />          
        </div>
      </div>

      <!-- Officials -->
      <div class="@container mt-12">
        <h2 class="text-xl text-gray-800 mb-4 font-medium">Overheidsfunctionarissen</h2>
        <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
          <div class="@lg:col-span-2">
            <MultiSelect bind:selected={selectedOfficials} options={data.allOfficialsOptions} 
            placeholder="Selecteer 1 of meerdere functionarissen" required />
          </div>
        </div>
      </div>

      <!-- Lobbyists -->
      <div class="@container mt-12">
        <h2 class="text-xl text-gray-800 mb-4 font-medium">Lobbyisten</h2>
        <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
          <div class="@lg:col-span-2">
            <MultiSelect bind:selected={selectedLobbyists} options={data.allLobbyistsOptions} 
            placeholder="Selecteer 1 of meerdere lobbyisten" required on:add={lobbyistAdded}
            on:remove={lobbyistRemoved} />
          </div>
        </div>

        {#if consultantIds.length > 0}
          <p class="mt-4">Kies voor onderstaande lobbyisten welke klanten zij vertegenwoordigen tijdens deze afspraak.</p>
          <div class="border border-gray-300">
            <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4 p-4">
            {#each consultantIds as consultantId}
              <Consultant representativeName={data.allRepresentativeNames[consultantId]} bind:allSelectedClients={allSelectedClients}
                      consultantId={consultantId}
                      allClientsOptions={data.clientsForRepresentatives[consultantId]} />
            {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Contact for more info -->
      <div class="@container mt-12">
        <h2 class="text-xl text-gray-800 mb-4 font-medium">Contact voor meer informatie</h2>
        <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
          <div>
            <label for="contact_name" class="block text-base font-medium text-gray-800 mb-2">
              Naam/afdeling
            </label>
            <input
              type="text"
              name="contact_name"
              id="contact_name"
              required
              class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
              placeholder="Vul naam en/of afdeling in"
            />
          </div>
          <div>
            <label for="contact_method" class="block text-base font-medium text-gray-800 mb-2">
              Contactinfo
            </label>
            <input
              type="text"
              name="contact_method"
              id="contact_method"
              required
              class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
              placeholder="Telefoonnummer en/of e-mailadres"
            />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <Button type="submit">
          Opslaan
        </Button>
      </div>
    </div>
  </div>
</form>