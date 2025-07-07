<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { organizationTypeLabels } from '../../../types.js';
  import { getSectorName } from '../../../utils/organizationUtils.js';

  let { data } = $props();

  const formatRegistrationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
</script>

<!-- Header -->
<div class="flex flex-wrap gap-x-16 gap-y-4 justify-between items-start mb-8">
  <div>
    <h1 class="text-3xl font-semibold text-gray-800 mb-3 max-w-5xl">
      {data.organization.name}
      <a href="/organisaties/{data.organization.id}/bewerken" 
        title="Bewerk lobbyorganisatie">
        <img src="/edit.svg" alt="Bewerk lobbyorganisatie" class="w-8 inline ml-4" />
      </a>
    </h1>
    <p class="text-2xl text-gray-700">Lobbyorganisatie</p>
  </div>
  <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
    <button
      onclick={() => (history.length > 1 ? history.back() : goto('/'))}
      class="text-gov-blue hover:text-gov-dark-blue hover:underline text-lg my-1 cursor-pointer"
    >
      ← Terug naar overzicht
    </button>
    <Button variant="link" href="/afspraken?organization={data.organization.id}">
      Doorzoek afspraken
    </Button>
  </div>
</div>

<!-- Primary Details -->
<div class="lg:col-span-2 grid gap-8">
  <!-- Basic Information -->
  <div class="@container">
    <h2 class="text-xl font-medium text-gray-800 mb-4">Informatie</h2>
    <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Organisatienaam</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">{data.organization.name}</p>
      </div>

      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Sector</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {getSectorName(data.organization.sector)}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Belangenbehartiging</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {organizationTypeLabels[data.organization.type]}
        </p>
      </div>

      {#if data.organization.kvk_number}
        <div class="p-4 border border-gray-300">
          <p class="text-sm font-medium text-gray-700 mb-1">KVK-nummer</p>
          <p class="text-lg text-gray-900 leading-snug line-clamp-2">
            {data.organization.kvk_number}
          </p>
        </div>
      {/if}

        <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Plaats</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.organization.city}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Website</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          <a href="https://{data.organization.website}" class="text-gov-blue">{data.organization.website}</a>
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Status</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.organization.active ? 'Actief' : 'Inactief'}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Geregistreerd op</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {formatRegistrationDate(data.organization.registered_at)}
        </p>
      </div>
    </div>
  </div>

  <!-- Lobbyists -->
  <div class="@container">
    <h2 class="text-xl text-gray-800 mb-4 font-medium">Lobbyisten</h2>
    <div class="grid gap-3 @4xl:grid-cols-2">
      {#each data.lobbyists as lobbyist}
        <div class="border border-gray-300 p-4">
          <h3 class="font-medium text-lg text-gray-900 leading-snug">{lobbyist.name}</h3>
          <p class="text-gray-700 leading-snug line-clamp-2">{lobbyist.function}</p>
        </div>
      {:else}
        <p class="text-gray-600 text-lg">Geen lobbyisten geregistreerd.</p>
      {/each}
    </div>
  </div>

  <!-- Client Organizations (for consultants) -->
  {#if data.organization.type === 'consultant'}
    <div class="@container">
      <h2 class="text-xl text-gray-800 mb-4 font-medium">Cliëntorganisaties</h2>
      <div class="grid gap-3 @4xl:grid-cols-2">
        {#each data.clientOrganizations as client}
          <div class="border border-gray-300 p-4 flex flex-col h-full">
            <h3 class="font-medium text-lg text-gray-900 leading-snug">{client.client_name}</h3>
            <p class="text-gray-700 leading-snug line-clamp-2 flex-grow">{client.client_sector}</p>
            <a
              href="/organisaties/{client.client_id}"
              class="text-gov-blue hover:text-gov-dark-blue hover:underline mt-1"
            >
              → Bekijk organisatie
            </a>
          </div>
        {:else}
          <p class="text-gray-600 text-lg">Geen cliënten geregistreerd.</p>
        {/each}
      </div>
    </div>
  {/if}

  {#if data.representativeOrganizations.length > 0}
    <!-- Representative Organizations -->
    <div class="@container">
      <h2 class="text-xl text-gray-800 mb-4 font-medium">Vertegenwoordigende organisaties</h2>
      <div class="grid gap-3 @4xl:grid-cols-2">
        {#each data.representativeOrganizations as representative}
          <div class="border border-gray-300 p-4 flex flex-col h-full">
            <h3 class="font-medium text-lg text-gray-900 leading-snug">
              {representative.representative_name}
            </h3>
            <a
              href="/organisaties/{representative.representative_id}"
              class="text-gov-blue hover:text-gov-dark-blue hover:underline mt-1"
            >
              → Bekijk organisatie
            </a>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
