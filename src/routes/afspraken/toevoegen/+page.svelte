<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { goto } from '$app/navigation';
  import { meetingTypeLabels, officialTypeLabels } from '../../../types';
  import { formatDate, formatRegistrationDate } from '../../../utils/dateUtils';
  import { enhance } from '$app/forms';
  import { listFormat } from '../../../utils/stringUtils';
	import { DateInput } from 'date-picker-svelte'
  import MultiSelect from 'svelte-multiselect'  

  const { data, form } = $props();
  let date = $state(new Date());
  let selectedOfficials = $state([]);
  let selectedPolicyAreas = $state([]);
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
  </div>
{/if}

<form method="POST" use:enhance={({formData}) => {
        formData.append('meeting_date', date.toISOString());
        formData.append('selected_officials', JSON.stringify(selectedOfficials.map((official) => official.value)));
        formData.append('policy_areas', JSON.stringify(selectedPolicyAreas.map((spa) => spa.value)));}}>
  <!-- Primary Details -->
  <div class="lg:col-span-2 grid gap-8">
    <!-- Basic Information -->
    <div class="@container">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Informatie</h2>

      <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
        <div class="@lg:col-span-2 p-4">
          <label for="description" class="block text-lg font-medium text-gray-800 mb-2">
            Beschrijving
          </label>
          <input
            type="text"
            name="description"
            id="description"
            required
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Beschrijving van afspraak"
          />
        </div>
        <div class="@lg:col-span-2 p-4">
          <label for="policy_areas" class="block text-lg font-medium text-gray-800 mb-2">
            Beleidsgebieden
          </label>
          <MultiSelect bind:selected={selectedPolicyAreas} options={data.allPolicyAreaOptions}
          placeholder="Selecteer 1 of meerdere beleidsgebieden" required />             
        </div>
        <div class="p-4">
          <label for="meeting_type" class="block text-lg font-medium text-gray-800 mb-2">
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
        <div class="p-4">
          <label for="meeting_location" class="block text-lg font-medium text-gray-800 mb-2">
            Locatie
          </label>
          <input
            type="text"
            name="meeting_location"
            id="meeting_location"
            required
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Bv Tweede Kamer, Den Haag"
          />
        </div>
        <div class="p-4">
          <label for="meeting_date" class="block text-lg font-medium text-gray-800 mb-2">
            Datum
          </label>
          <DateInput bind:value={date} format="dd-MM-yyyy" required />          
        </div>
        <div class="p-4">
          <p class="text-sm font-medium text-gray-700 mb-1">Geregistreerd op</p>
          <p class="text-lg text-gray-900 leading-snug line-clamp-2">
            {new Date()}
          </p>
        </div>
      </div>

      <!-- Officials -->
      <div class="@container mt-4">
        <h2 class="text-xl text-gray-800 mb-4 font-medium">Overheidsfunctionarissen</h2>
        <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
          <div class="@lg:col-span-2">
            <MultiSelect bind:selected={selectedOfficials} options={data.allOfficialsOptions} 
            placeholder="Selecteer 1 of meerdere functionarissen" required />                
          </div>
        </div>
      </div>

      <!-- Lobbyists -->
      <div class="@container mt-4">
        <h2 class="text-xl text-gray-800 mb-4 font-medium">Lobbyisten</h2>
      </div>
      <div>TODO</div>

      <div class="mt-4">
        <Button type="submit">
          Opslaan
        </Button>
      </div>
    </div>
  </div>
</form>