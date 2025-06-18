<script lang="ts">
  let { data } = $props();
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Lobbyregister</h1>
    <a href="/meetings" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Beheer afspraken →
    </a>
  </div>

  <!-- Quick actions -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
      <h2 class="text-xl font-semibold mb-3 text-blue-800">🏢 Organisaties</h2>
      <p class="text-blue-700 mb-4">Beheer lobby-organisaties, consultants en verenigingen</p>
      <a
        href="/organizations/create"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
      >
        Nieuwe organisatie registreren
      </a>
    </div>

    <div class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
      <h2 class="text-xl font-semibold mb-3 text-green-800">👥 Overheidsfunctionarissen</h2>
      <p class="text-green-700 mb-4">Registreer ministers, staatssecretarissen en ambtenaren</p>
      <a
        href="/officials/create"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
      >
        Nieuwe functionaris registreren
      </a>
    </div>
  </div>
  <!-- Data Display -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Organizations -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Geregistreerde organisaties</h2>
        <span class="text-sm text-gray-600">{data.organizations.length} organisaties</span>
      </div>
      <div class="space-y-4">
        {#each data.organizations as org}
          <div class="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold">{org.name}</h3>
                </div>
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

        {#if data.organizations.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p class="mb-2">Nog geen organisaties geregistreerd.</p>
            <a href="/organizations/create" class="text-blue-500 hover:text-blue-700 underline">
              Registreer je eerste organisatie
            </a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Government Officials -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Overheidsfunctionarissen</h2>
        <span class="text-sm text-gray-600">{data.officials.length} functionarissen</span>
      </div>
      <div class="space-y-4">
        {#each data.officials as official}
          {@const functionName = {
            minister: 'Minister',
            state_secretary: 'Staatssecretaris',
            secretary_general: 'Secretaris-generaal',
            director_general: 'Directeur-generaal',
            political_assistant: 'Politiek assistent',
          }[official.type]}
          <div class="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold">{official.name}</h3>
            </div>
            <p class="text-sm text-gray-600">
              Functie: {functionName}
            </p>
            <p class="text-sm text-gray-600">Departement: {official.department}</p>
          </div>
        {/each}

        {#if data.officials.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p class="mb-2">Nog geen functionarissen geregistreerd.</p>
            <a href="/officials/create" class="text-blue-500 hover:text-blue-700 underline">
              Registreer je eerste functionaris
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
