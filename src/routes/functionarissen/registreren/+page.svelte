<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { enhance } from '$app/forms';
  import { OFFICIAL_TYPES } from '$lib/constants.js';

  let { form } = $props();

  const officials = new Map<(typeof OFFICIAL_TYPES)[number], string>([
    ['mayor', 'Burgemeester'],
    ['alderman', 'Wethouder'],
    ['municipal_secretary', 'Gemeentesecretaris'],
    ['director', 'Directeur'],
    ['political_assistant', 'Politiek assistent'],
  ]);

  const organisations = [
    'College van Burgemeester en Wethouders',
    'Gemeentelijk Management Team',
  ];
</script>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Registreren</h2>

  <p class="text-lg text-gray-600 mb-8">Registreren van een gemeentefunctionaris.</p>

  {#if form?.message}
    <div class="mb-6 p-4 bg-red-100 text-red-700 border border-red-200">
      {form.message}
      <ul>
        {#each form?.issues as { message, path }}
          <li class="pl-4">- {path[0]} - {message}</li>
        {/each}
      </ul>
    </div>
    <script lang="ts">
      window.scrollTo({ top: 100, behavior: 'smooth' });
    </script>
  {/if}

  <form method="POST" use:enhance class="space-y-6">
    <div>
      <label for="name" class="block text-lg font-bold text-gray-800 mb-2">
        Voor- en achternaam
      </label>
      <input
        type="text"
        name="name"
        id="name"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Vul uw voor- en achternaam in."
      />
    </div>

    <div>
      <label for="type" class="block text-lg font-bold text-gray-800 mb-2"> Functietitel </label>
      <select
        name="type"
        id="type"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
      >
        <option value="">Selecteer type...</option>
        {#each officials as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="department" class="block text-lg font-bold text-gray-800 mb-2">
        Organisatie
      </label>
      <select
        name="department"
        id="department"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
      >
        <option value="">Selecteer organisatie...</option>
        {#each organisations as organisation}
          <option value={organisation}>{organisation}</option>
        {/each}
      </select>
    </div>

    <Button type="submit">Registreren</Button>
  </form>
</div>
