<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  type FormType = 'org' | 'official' | 'lobbyist' | 'representation' | null;
  let activeForm: FormType = $state(null);

  function toggleForm(formType: FormType) {
    activeForm = activeForm === formType ? null : formType;
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Lobbyregister</h1>
    <a href="/meetings" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Beheer afspraken →
    </a>
  </div>

  {#if form?.message}
    <div
      class="mb-4 p-4 {form.success
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'} rounded"
    >
      {form.message}
    </div>
  {/if}

  <!-- Navigatie knoppen -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <button
      onclick={() => toggleForm('org')}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {activeForm === 'org' ? 'Verberg' : 'Registreer'} organisatie
    </button>

    <button
      onclick={() => toggleForm('official')}
      class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      {activeForm === 'official' ? 'Verberg' : 'Registreer'} overheidsfunctionaris
    </button>

    <button
      onclick={() => toggleForm('lobbyist')}
      class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
    >
      {activeForm === 'lobbyist' ? 'Verberg' : 'Registreer'} lobbyist
    </button>

    <button
      onclick={() => toggleForm('representation')}
      class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
    >
      {activeForm === 'representation' ? 'Verberg' : 'Registreer'} vertegenwoordiging
    </button>
  </div>

  <!-- Organisatie formulier -->
  {#if activeForm === 'org'}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Registreer organisatie</h2>
      <form method="POST" action="?/createOrganization" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium mb-1">Organisatienaam</label>
            <input type="text" name="name" id="name" required class="w-full p-2 border rounded" />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium mb-1">Organisatietype</label>
            <select name="type" id="type" required class="w-full p-2 border rounded">
              <option value="">Selecteer type...</option>
              <option value="inhouse">Interne lobby</option>
              <option value="consultant">Externe lobby</option>
              <option value="association">Vereniging</option>
            </select>
          </div>

          <div>
            <label for="sector" class="block text-sm font-medium mb-1">Sector</label>
            <input
              type="text"
              name="sector"
              id="sector"
              required
              class="w-full p-2 border rounded"
            />
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

        <button
          type="submit"
          class="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Registreer organisatie
        </button>
      </form>
    </div>
  {/if}

  <!-- Overheidsfunctionaris formulier -->
  {#if activeForm === 'official'}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Registreer overheidsfunctionaris</h2>
      <form method="POST" action="?/createOfficial" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="official_name" class="block text-sm font-medium mb-1">Naam</label>
            <input
              type="text"
              name="name"
              id="official_name"
              required
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label for="official_function" class="block text-sm font-medium mb-1">Functie</label>
            <input
              type="text"
              name="function"
              id="official_function"
              required
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label for="department" class="block text-sm font-medium mb-1">Departement</label>
            <input
              type="text"
              name="department"
              id="department"
              required
              class="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          class="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Registreer functionaris
        </button>
      </form>
    </div>
  {/if}

  <!-- Lobbyist formulier -->
  {#if activeForm === 'lobbyist'}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Registreer lobbyist</h2>
      <form method="POST" action="?/createLobbyist" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="organization_id" class="block text-sm font-medium mb-1">Organisatie</label>
            <select
              name="organization_id"
              id="organization_id"
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Selecteer organisatie...</option>
              {#each data.organizations as org}
                <option value={org.id}>{org.name} ({org.type})</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="lobbyist_name" class="block text-sm font-medium mb-1">Naam</label>
            <input
              type="text"
              name="name"
              id="lobbyist_name"
              required
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label for="lobbyist_function" class="block text-sm font-medium mb-1">Functie</label>
            <input
              type="text"
              name="function"
              id="lobbyist_function"
              required
              class="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          class="mt-4 bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
        >
          Registreer lobbyist
        </button>
      </form>
    </div>
  {/if}

  <!-- Vertegenwoordiging formulier -->
  {#if activeForm === 'representation'}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Registreer vertegenwoordiging</h2>
      <p class="text-sm text-gray-600 mb-4">
        Voor externe lobbybureaus om hun cliënten te registreren
      </p>
      <form method="POST" action="?/addRepresentation" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="representative_id" class="block text-sm font-medium mb-1">
              Externe lobbyorganisatie
            </label>
            <select
              name="representative_id"
              id="representative_id"
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Selecteer externe lobbyorganisatie...</option>
              {#each data.organizations.filter((org) => org.type === 'consultant') as org}
                <option value={org.id}>{org.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="client_id" class="block text-sm font-medium mb-1">
              Cliëntorganisatie
            </label>
            <select name="client_id" id="client_id" required class="w-full p-2 border rounded">
              <option value="">Selecteer cliëntorganisatie...</option>
              {#each data.organizations as org}
                <option value={org.id}>{org.name} ({org.type})</option>
              {/each}
            </select>
          </div>
        </div>

        <button
          type="submit"
          class="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
        >
          Registreer vertegenwoordiging
        </button>
      </form>
    </div>
  {/if}

  <!-- Data Display -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Organizations -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Geregistreerde organisaties</h2>
      <div class="space-y-4">
        {#each data.organizations as org}
          <div class="border rounded-lg p-4 bg-white">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{org.name}</h3>
                <p class="text-sm text-gray-600">Sector: {org.sector}</p>
                <p class="text-sm text-gray-600">Type: {org.type}</p>
                <p class="text-sm text-gray-600">Commercieel: {org.is_commercial ? 'Ja' : 'Nee'}</p>
                {#if org.address}
                  <p class="text-sm text-gray-600">Adres: {org.address}</p>
                {/if}
              </div>
              <span
                class="px-2 py-1 text-xs rounded {org.type === 'consultant'
                  ? 'bg-blue-100 text-blue-800'
                  : org.type === 'inhouse'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'}"
              >
                {org.type}
              </span>
            </div>

            <!-- Show lobbyists for this organization -->
            {#each data.lobbyists.filter((lobbyist) => lobbyist.organization_id === org.id) as lobbyist}
              <div class="mt-3 ml-4 p-2 bg-gray-50 rounded">
                <p class="text-sm">
                  <strong>Lobbyist:</strong>
                  {lobbyist.name}
                </p>
                <p class="text-sm text-gray-600">Functie: {lobbyist.function}</p>
              </div>
            {/each}

            <!-- Show client representations if this is a consultant -->
            {#if org.type === 'consultant'}
              {#each data.representatives.filter((rep) => rep.representative_id === org.id) as rep}
                {@const client = data.organizations.find((o) => o.id === rep.client_id)}
                {#if client}
                  <div class="mt-3 ml-4 p-2 bg-blue-50 rounded">
                    <p class="text-sm">
                      <strong>Vertegenwoordigt:</strong>
                      {client.name}
                    </p>
                    <p class="text-sm text-gray-600">Cliënttype: {client.type}</p>
                  </div>
                {/if}
              {/each}
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Government Officials -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Overheidsfunctionarissen</h2>
      <div class="space-y-4">
        {#each data.officials as official}
          <div class="border rounded-lg p-4 bg-white">
            <h3 class="font-semibold">{official.name}</h3>
            <p class="text-sm text-gray-600">Functie: {official.function}</p>
            <p class="text-sm text-gray-600">Departement: {official.department}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
