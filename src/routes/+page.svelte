<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import { listFormat } from '../utils/stringUtils.js';

  const { data } = $props();
</script>

<div class="my-12">
  <h1 class="text-4xl font-semibold text-gray-800 mb-5">Lobbyregister</h1>
  <p class="sm:text-balance text-lg sm:text-xl text-gray-700 max-w-2xl">
    Het lobbyregister geeft inzicht in de contacten van organisaties die belangen behartigen bij
    ministers, staatssecretarissen en topambtenaren. Belangenbehartigers/lobbyisten moeten zich hier registreren;
    de overheidsfunctionaris registreert vervolgens de specifieke afspraak.
  </p>
</div>

<div class="bg-gov-light-blue p-6 sm:p-8 my-8">
  <h2 class="text-xl font-medium text-gray-800 mb-4">Zoeken in het lobbyregister</h2>
  <form method="post" action="?/search" use:enhance class="flex max-sm:flex-col gap-4 mb-4 max-w-2xl">
    <input
      type="search"
      name="search"
      value=""
      placeholder="Zoeken in onderwerpen"
      class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
    />
    <Button type="submit">Zoeken</Button>
  </form>
  <a class="text-gov-blue mr-4 hover:underline" href="/afspraken">Uitgebreid zoeken</a>
</div>

<div class="grid md:grid-cols-2 gap-6 lg:gap-8 my-12">
  <div class="grid gap-4 h-min">
    <h2 class="text-2xl font-medium text-gray-800 mb-2">Recente afspraken</h2>
    {#each data.meetings as meeting, i}
      <div class="border border-gray-300 pb-3 p-4 min-w-0 {i >= 3 ? 'max-md:hidden' : ''}">
        <a
          href="/afspraken/{meeting.id}"
          class="font-medium text-lg text-gov-blue hover:underline leading-snug mb-1.5 inline-block"
        >
          {meeting.description}
        </a>
        <p class="text-gray-600 mb-1 truncate">
          {listFormat.format(meeting.departments)}
        </p>
        <p class="text-gray-600 mb-1">
          Afspraak op {new Date(meeting.date).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    {/each}
    <a class="text-gov-blue hover:underline text-lg font-medium py-1" href="/afspraken">
      <span class="mr-1">→</span>
      Bekijk alle afspraken
    </a>
  </div>
  <div class="grid gap-4 h-min">
    <h2 class="text-2xl font-medium text-gray-800 mb-2">Recente registraties</h2>
    {#each data.registrations as organization, i}
      {@const interest = {
        inhouse: 'eigen belangen',
        inhouse_ngo: 'eigen belangen (NGO)',
        consultant: 'cliëntenbelangen',
        association: 'sectorbelangen',
      }[organization.type]}
      <div class="border border-gray-300 pb-3 p-4 {i >= 3 ? 'max-md:hidden' : ''}">
        <a
          href="/organisaties/{organization.id}"
          class="font-medium text-lg text-gov-blue hover:underline leading-snug mb-1.5 inline-block"
        >
          {organization.name}
        </a>
        <p class="text-gray-600 mb-1 truncate">
          Behartiging van {interest}
        </p>
        <p class="text-gray-600 mb-1">
          Geregistreerd op {new Date(organization.registered_at).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    {/each}
    <a class="text-gov-blue hover:underline text-lg font-medium py-1" href="/organisaties">
      <span class="mr-1">→</span>
      Bekijk alle lobbyisten
    </a>
  </div>
</div>
