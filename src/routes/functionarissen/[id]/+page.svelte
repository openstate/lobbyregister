<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { officialTypeLabels } from '../../../types.js';
    import { formatDate } from '../../../utils/dateUtils.js';

  const { data } = $props();
</script>

<!-- Header -->
<div class="flex flex-wrap gap-x-16 gap-y-4 justify-between items-start mb-8">
  <div>
    <h1 class="text-3xl font-semibold text-gray-800 mb-3 max-w-5xl">
      {data.official.name}
    </h1>
    <p class="text-2xl text-gray-700">Gemeentefunctionaris</p>
  </div>
  <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
    <button
      onclick={() => (history.length > 1 ? history.back() : goto('/'))}
      class="text-gov-blue hover:text-gov-dark-blue hover:underline text-lg my-1 cursor-pointer"
    >
      ← Terug naar overzicht
    </button>
    <Button variant="link" href="/afspraken?official={data.official.id}">Doorzoek afspraken</Button>
  </div>
</div>

<!-- Primary Details -->
<div class="lg:col-span-2 grid gap-8">
  <!-- Basic Information -->
  <div class="@container">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Informatie</h2>
    <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-bold text-gray-700 mb-1">Naam</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">{data.official.name}</p>
      </div>

      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-bold text-gray-700 mb-1">Organisatie</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.official.department}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-bold text-gray-700 mb-1">Functie</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {officialTypeLabels[data.official.type]}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-bold text-gray-700 mb-1">Status</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.official.active ? 'Actief' : 'Inactief'}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-bold text-gray-700 mb-1">Geregistreerd op</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {formatDate(data.official.registered_at)}
        </p>
      </div>
    </div>
  </div>
</div>
