<script lang="ts">
  import { enhance } from '$app/forms';
  import { SBI_CODES } from '$lib/constants';
  import Button from '$lib/components/Button.svelte';
  import { LOBBY_TYPES } from '../../../types.js';
  import FormMessages from '$lib/components/FormMessages.svelte';
  import MultiSelect from 'svelte-multiselect';

  let { form, data } = $props();
  let selectedType = $state('');
  let selectedClients = $state([]);

  function enHanceForm(formData: FormData) {
    formData.append('selected_clients', JSON.stringify(selectedClients));
  }
</script>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Registreren</h2>

  <p class="text-lg text-gray-600 mb-8">
    Registreren als organisatie die belangen behartigt bij de overheid.
  </p>

  <FormMessages message={form?.message} issues={form?.issues} />

  <form method="POST" use:enhance={({formData}) => enHanceForm(formData)} class="space-y-6">
    <!-- Organization Details -->
    <div>
      <label for="name" class="block text-lg font-medium text-gray-800 mb-2">
        Organisatienaam
      </label>
      <input
        type="text"
        name="name"
        id="name"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Vul de naam van uw organisatie in."
      />
    </div>

    <div>
      <label for="city" class="block text-lg font-medium text-gray-800 mb-2">
        Plaats
      </label>
      <input
        type="text"
        name="city"
        id="city"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Vul de vestigingsplaats van uw organisatie in."
      />
    </div>

    <div>
      <label for="website" class="block text-lg font-medium text-gray-800 mb-2">
        Website
      </label>
      <input
        type="text"
        name="website"
        id="website"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Vul de website van uw organisatie in."
      />
    </div>

    <div>
      <label for="kvk_number" class="block text-lg font-medium text-gray-800 mb-2">KVK-nummer</label
      >
      <input
        type="text"
        name="kvk_number"
        id="kvk_number"
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Vul het KVK-nummer van uw organisatie in."
      />
      <label class="flex items-center gap-2 mt-2 text-lg">
        <input
          type="checkbox"
          name="no_kvk"
          id="no_kvk"
          class="focus:outline-2 outline-offset-1 focus:outline-gov-blue size-4"
        />
        <span class="text-gray-600">De organisatie heeft geen KVK-nummer.</span>
      </label>
    </div>

    <div>
      <label for="sector" class="block text-lg font-medium text-gray-800 mb-2">Sector (SBI-code)</label>
      <select
        name="sector"
        id="sector"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
      >
        <option value="">Selecteer sector...</option>
        {#each SBI_CODES as [sbiCode, label]}
          <option value={sbiCode}>{label}</option>
        {/each}
      </select>
    </div>

    <!-- Lobby Type Selection -->
    <div>
      <p class="block text-lg font-medium text-gray-800 mb-2">Type belangenbehartiging</p>
      <div class="grid gap-3">
        {#each LOBBY_TYPES as lobbyType}
          <label
            class="border border-gray-300 px-4 py-3 cursor-pointer has-checked:bg-gov-light-blue has-checked:border-gov-blue"
          >
            <div class="flex items-center gap-2 mb-1">
              <input type="radio" name="type" bind:group={selectedType} value={lobbyType.id} />
              <span class="text-lg text-gray-800">{lobbyType.label}</span>
            </div>
            <p class="text-gray-700">{lobbyType.description}</p>
          </label>
        {/each}
      </div>
    </div>

    <h2 class="font-semibold text-gray-800 text-2xl mb-2 mt-12">Lobbyist toevoegen</h2>
    <span class="text-gray-800"><em>U kunt na registreren desgewenst meer lobbyisten toevoegen</em></span>
    <div class="@container space-y-4 mt-4">
      <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4 mb-1">
        <div>
          <label for="lobbyist_name" class="@lg:col-span-1 block text-lg font-medium text-gray-800">
            Naam
          </label>
        </div>
        <div>
          <label for="lobbyist_function" class="@lg:col-span-1 block text-lg font-medium text-gray-800">
            Function
          </label>
        </div>
      </div>
      <div class="grid grid-cols-[auto_auto_24px] gap-4 mb-1">
        <div>
          <input
            type="text"
            name="lobbyist_name"
            id="lobbyist_name"
            required
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Vul de naam van de lobbyist in"
          />
        </div>
        <div>
          <input
            type="text"
            name="lobbyist_function"
            id="lobbyist_function"
            required
            class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
            placeholder="Vul de functie van de lobbyist in"
          />
        </div>
      </div>
    </div>

    {#if (selectedType == 'consultant')}
    <h2 class="font-semibold text-gray-800 text-2xl mb-2 mt-12">Cliëntorganisaties</h2>
    <div class="@container space-y-4">
      <div>
        <span class="block text-base text-gray-800">
          Geef hieronder aan voor welke klanten deze lobbyorganisatie de belangen vertegenwoordigt.
        </span>
        <div class="grid gap-3 mt-3">
          <MultiSelect bind:selected={
            () => selectedClients,
            (v) => {selectedClients = v;}
            }
            options={data.allClientOrganizationLabels}
            placeholder="Selecteer 1 of meerdere klanten" required />
        </div>
      </div>
    </div>
    {/if}

    <Button type="submit">
      Registreren
    </Button>
  </form>
</div>
