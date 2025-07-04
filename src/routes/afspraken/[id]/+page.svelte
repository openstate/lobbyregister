<script lang="ts">
  import { goto } from '$app/navigation';
  import { meetingTypeLabels, officialTypeLabels } from '../../../types';
  import { formatDate, formatRegistrationDate } from '../../../utils/dateUtils';
  import { listFormat } from '../../../utils/stringUtils';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<!-- Header -->
<div class="flex flex-wrap gap-x-16 gap-y-4 justify-between items-start mb-8">
  <div>
    <h1 class="text-3xl font-semibold text-gray-800 mb-3 max-w-5xl line-clamp-1">
      {data.meeting.description}
    </h1>
    <p class="text-2xl text-gray-700">Afspraak</p>
  </div>
  <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
    <button
      onclick={() => (history.length > 1 ? history.back() : goto('/'))}
      class="text-gov-blue hover:text-gov-dark-blue hover:underline text-lg my-1 cursor-pointer"
    >
      ← Terug naar overzicht
    </button>
  </div>
</div>

<!-- Primary Details -->
<div class="lg:col-span-2 grid gap-8">
  <!-- Basic Information -->
  <div class="@container">
    <h2 class="text-xl font-medium text-gray-800 mb-4">Informatie</h2>
    <div class="grid @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Onderwerp en toelichting</p>
        <p class="text-lg text-gray-900 leading-snug preserve_whitespace">{data.meeting.description}</p>
      </div>

      <div class="@lg:col-span-2 p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Beleidsgebieden</p>
        {#if data.meeting.policy_areas.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each data.meeting.policy_areas as area}
              <a
                href="/afspraken?policy_area={area}"
                class="px-2 text-gov-blue py-1 bg-gov-light-blue inline-block text-lg hover:underline cursor-pointer leading-snug"
              >
                {area}
              </a>
              <!-- <span class="mx-2 last-of-type:hidden">·</span> -->
            {/each}
          </div>
        {:else}
          <p class="text-lg text-gray-900 leading-snug">Geen beleidsgebieden geregistreerd.</p>
        {/if}
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Type afspraak</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {meetingTypeLabels[data.meeting.type]}
        </p>
      </div>

      {#if data.meeting.location}
        <div class="p-4 border border-gray-300">
          <p class="text-sm font-medium text-gray-700 mb-1">Locatie</p>
          <p class="text-lg text-gray-900 leading-snug line-clamp-2">{data.meeting.location}</p>
        </div>
      {/if}

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Datum</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {formatDate(data.meeting.date)}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Geregistreerd op</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {formatRegistrationDate(data.meeting.registered_at)}
        </p>
      </div>
    </div>
  </div>

  <!-- Officials -->
  <div class="@container">
    <h2 class="text-xl text-gray-800 mb-4 font-medium">Overheidsfunctionarissen</h2>
    <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
      {#each data.officials as official}
        <div class="@lg:col-span-2 border border-gray-300 p-4 flex flex-col h-full">
          <h3 class="font-medium text-lg text-gray-900 leading-snug">{official.name}</h3>
          <p class="text-gray-700 leading-snug line-clamp-2">
            {official.department}
          </p>
          <p class="text-gray-700 leading-snug line-clamp-2">
            {officialTypeLabels[official.type]}
          </p>
          <a
            href="/functionarissen/{official.id}"
            class="text-gov-blue hover:text-gov-dark-blue hover:underline mt-1"
          >
            → Bekijk functionaris
          </a>
        </div>
      {:else}
        <p class="text-gray-600 text-lg">Geen overheidsfunctionarissen geregistreerd.</p>
      {/each}
    </div>
  </div>

  <!-- Lobbyists -->
  <div class="@container">
    <h2 class="text-xl text-gray-800 mb-4 font-medium">Lobbyisten</h2>
    <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
      {#each data.lobbyists as lobbyist}
        {@const reps = data.representations
          .filter((rep) => rep.meeting_lobbyist_id === lobbyist.meeting_lobbyist_id)
          .map((rep) => rep.client_name)}
        <div class="@lg:col-span-2 border border-gray-300 p-4 flex flex-col h-full">
          <h3 class="font-medium text-lg text-gray-900 leading-snug">{lobbyist.name}</h3>
          <p class="text-gray-700 leading-snug">
            {lobbyist.organization_name}
            {#if reps.length}
              (namens {listFormat.format(reps)})
            {/if}
          </p>
          <p class="text-gray-700 leading-snug line-clamp-2">{lobbyist.function}</p>
          <div class="flex flex-wrap gap-2 mt-auto">
            <a
              href="/organisaties/{lobbyist.organization_id}"
              class="text-gov-blue hover:text-gov-dark-blue hover:underline mt-1"
            >
              → Bekijk belangenbehartiger
            </a>
          </div>
        </div>
      {:else}
        <p class="text-gray-600 text-lg">Geen lobbyisten geregistreerd.</p>
      {/each}
    </div>
  </div>

    <!-- Contact for more info -->
  <div class="@container">
    <h2 class="text-xl text-gray-800 mb-4 font-medium">Contact voor meer informatie</h2>
    <div class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Naam/afdeling</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.meeting.contact_name}
        </p>
      </div>

      <div class="p-4 border border-gray-300">
        <p class="text-sm font-medium text-gray-700 mb-1">Telefoon of e-mail</p>
        <p class="text-lg text-gray-900 leading-snug line-clamp-2">
          {data.meeting.contact_method}
        </p>
      </div>
    </div>
  </div>
</div>
