<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
  import { listFormat } from '../utils/stringUtils.js';

  const { data } = $props();
</script>

<div class="my-12">
  <h1 class="text-4xl font-semibold text-gray-800 mb-5">Lobbyregister Amsterdam</h1>
  <p class="sm:text-balance text-lg sm:text-xl text-gray-700">
    Het lobbyregister geeft inzicht in de contacten van organisaties die belangen behartigen bij de
    burgemeester, wethouders en topambtenaren. Belangenbehartigers/lobbyisten moeten zich hier
    registreren; de gemeentefunctionaris registreert vervolgens de specifieke afspraak.
  </p>
</div>

<div>
  <form
    method="post"
    action="?/search"
    use:enhance
    class="flex max-sm:flex-col gap-4 mb-4 max-w-2xl"
  >
    <input
      type="search"
      name="search"
      value=""
      placeholder="Zoeken in het lobbyregister"
      class="w-full text-xl bg-white border border-gray-300 px-4 py-3 focus:outline-2 placeholder:text-gray-600 outline-offset-1 focus:outline-gov-blue"
    />
    <Button type="submit" size="lg">Zoeken</Button>
  </form>
  <a class="text-gov-blue mr-4 text-lg caret hover:underline underline-offset-4" href="/afspraken"
    >Uitgebreid zoeken
  </a>
</div>

<div class="grid md:grid-cols-2 gap-6 lg:gap-8 my-12">
  <div class="grid gap-4 h-min">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Recente afspraken</h2>
    {#each data.meetings as meeting, i}
      <div class="border border-gray-300 pb-3 p-4 min-w-0 {i >= 3 ? 'max-md:hidden' : ''}">
        <a
          href="/afspraken/{meeting.id}"
          class="font-bold hover:underline text-lg text-gov-blue leading-snug mb-1.5 inline-block"
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
    <a
      class="text-gov-blue hover:underline underline-offset-4 caret text-lg font-medium py-1"
      href="/afspraken"
    >
      Bekijk alle afspraken
    </a>
  </div>
  <div class="grid gap-4 h-min">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Recente registraties</h2>
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
          class="text-lg hover:underline text-gov-blue font-bold leading-snug mb-1.5 inline-block"
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
    <a
      class="text-gov-blue hover:underline underline-offset-4 caret text-lg font-medium py-1"
      href="/organisaties"
    >
      Bekijk alle lobbyisten
    </a>
  </div>
</div>
