<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let lobbyists = $state([{ name: '', function: '' }]);
  let representations = $state([{ client_id: '' }]);
  let orgType = $state('');

  function addLobbyist() {
    lobbyists = [...lobbyists, { name: '', function: '' }];
  }

  function removeLobbyist(index: number) {
    lobbyists = lobbyists.filter((_, i) => i !== index);
  }

  function addRepresentation() {
    representations = [...representations, { client_id: '' }];
  }

  function removeRepresentation(index: number) {
    representations = representations.filter((_, i) => i !== index);
  }

  function handleTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    orgType = target.value;
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Nieuwe organisatie registreren</h1>
    <a href="/" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      ← Terug naar hoofdpagina
    </a>
  </div>

  {#if form?.message}
    <div
      class="mb-4 p-4 {'success' in form && form.success
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'} rounded"
    >
      {form.message}
    </div>
  {/if}

  <form method="POST" action="?/createOrganizationWithDetails" use:enhance class="space-y-6">
    <!-- Lobby Type Selection -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Wiens belangen behartigt uw organisatie?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="cursor-pointer">
          <input
            type="radio"
            name="type"
            value="inhouse"
            required
            class="sr-only peer"
            onchange={handleTypeChange}
          />
          <div
            class="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
          >
            <h3 class="font-semibold text-lg text-gray-800">Belangen van eigen organisatie</h3>
            <p class="text-sm text-gray-600 mt-2">Bedrijven en maatschappelijke organisaties</p>
          </div>
        </label>

        <label class="cursor-pointer">
          <input
            type="radio"
            name="type"
            value="association"
            required
            class="sr-only peer"
            onchange={handleTypeChange}
          />
          <div
            class="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
          >
            <h3 class="font-semibold text-lg text-gray-800">Belangen van sector of branche</h3>
            <p class="text-sm text-gray-600 mt-2">Brancheverenigingen en vakbonden</p>
          </div>
        </label>

        <label class="cursor-pointer">
          <input
            type="radio"
            name="type"
            value="consultant"
            required
            class="sr-only peer"
            onchange={handleTypeChange}
          />
          <div
            class="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
          >
            <h3 class="font-semibold text-lg text-gray-800">Belangen van cliënten</h3>
            <p class="text-sm text-gray-600 mt-2">Externe lobbybureaus</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Organization Details -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Organisatie gegevens</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-1">Organisatienaam</label>
          <input type="text" name="name" id="name" required class="w-full p-2 border rounded" />
        </div>

        <div>
          <label for="sector" class="block text-sm font-medium mb-1">Sector</label>
          <input type="text" name="sector" id="sector" required class="w-full p-2 border rounded" />
        </div>

        <div>
          <label for="is_commercial" class="block text-sm font-medium mb-1">Commercieel</label>
          <select
            name="is_commercial"
            id="is_commercial"
            required
            class="w-full p-2 border rounded"
          >
            <option value="true">Ja</option>
            <option value="false">Nee</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium mb-1">Adres (optioneel)</label>
          <input type="text" name="address" id="address" class="w-full p-2 border rounded" />
        </div>
      </div>
    </div>

    <!-- Lobbyists Section -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Lobbyisten</h2>
        <button
          type="button"
          onclick={addLobbyist}
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
        >
          + Lobbyist toevoegen
        </button>
      </div>

      {#each lobbyists as lobbyist, index}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white rounded border">
          <div>
            <label for="lobbyist_name_{index}" class="block text-sm font-medium mb-1">Naam</label>
            <input
              type="text"
              name="lobbyist_names"
              id="lobbyist_name_{index}"
              bind:value={lobbyist.name}
              class="w-full p-2 border rounded"
              placeholder="Naam van de lobbyist"
            />
          </div>

          <div>
            <label for="lobbyist_function_{index}" class="block text-sm font-medium mb-1">
              Functie
            </label>
            <input
              type="text"
              name="lobbyist_functions"
              id="lobbyist_function_{index}"
              bind:value={lobbyist.function}
              class="w-full p-2 border rounded"
              placeholder="Functie binnen de organisatie"
            />
          </div>

          {#if lobbyists.length > 1}
            <div class="md:col-span-2 flex justify-end">
              <button
                type="button"
                onclick={() => removeLobbyist(index)}
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Verwijderen
              </button>
            </div>
          {/if}
        </div>
      {/each}

      {#if lobbyists.length === 0}
        <p class="text-gray-600 text-center py-4">
          Geen lobbyisten toegevoegd. Klik op "Lobbyist toevoegen" om te beginnen.
        </p>
      {/if}
    </div>

    <!-- Representations Section (only for consultants) -->
    {#if orgType === 'consultant'}
      <div class="bg-gray-50 p-6 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Vertegenwoordigingen</h2>
          <button
            type="button"
            onclick={addRepresentation}
            class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
          >
            + Cliënt toevoegen
          </button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          Welke organisaties vertegenwoordigt dit externe lobbybureau?
        </p>

        {#each representations as representation, index}
          <div class="grid grid-cols-1 gap-4 mb-4 p-4 bg-white rounded border">
            <div>
              <label for="client_id_{index}" class="block text-sm font-medium mb-1">
                Cliëntorganisatie
              </label>
              <select
                name="client_ids"
                id="client_id_{index}"
                bind:value={representation.client_id}
                class="w-full p-2 border rounded"
              >
                <option value="">Selecteer cliëntorganisatie...</option>
                {#each data.organizations as org}
                  <option value={org.id}>{org.name} ({org.type})</option>
                {/each}
              </select>
            </div>

            {#if representations.length > 1}
              <div class="flex justify-end">
                <button
                  type="button"
                  onclick={() => removeRepresentation(index)}
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Verwijderen
                </button>
              </div>
            {/if}
          </div>
        {/each}

        {#if representations.length === 0}
          <p class="text-gray-600 text-center py-4">
            Geen cliënten toegevoegd. Klik op "Cliënt toevoegen" om te beginnen.
          </p>
        {/if}
      </div>
    {/if}

    <!-- Submit Button -->
    <div class="bg-white p-6 rounded-lg border-2 border-blue-200">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-blue-800 mb-2">Klaar om te registreren?</h3>
          <p class="text-sm text-blue-600">
            Alle gegevens worden tegelijk opgeslagen. Je kunt later nog wijzigingen maken.
          </p>
        </div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold text-lg"
        >
          Organisatie registreren
        </button>
      </div>
    </div>
  </form>
</div>
