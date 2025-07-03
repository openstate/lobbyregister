<script lang="ts">
  import { enhance } from '$app/forms';
  import { SBI_CODES } from '$lib/constants';
  import Button from '$lib/components/Button.svelte';

  let { form } = $props();

  const LOBBY_TYPES = [
    {
      id: 'inhouse',
      label: 'Belangen van eigen organisatie',
      description: 'Bijvoorbeeld bedrijven of maatschappelijke organisaties.',
    },
    {
      id: 'association',
      label: 'Belangen van sector of branche',
      description: 'Bijvoorbeeld brancheverenigingen of koepelorganisaties.',
    },
    {
      id: 'consultant',
      label: 'Belangen van cliënten',
      description: 'Bijvoorbeeld externe lobbybureaus.',
    },
  ] as const;
</script>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Registreren</h2>

  <p class="text-lg text-gray-600 mb-8">
    Registreren als organisatie die belangen behartigt bij de overheid.
  </p>

  {#if form?.message}
    <div class="mb-6 p-4 bg-red-100 text-red-700 border border-red-200">
      {form.message}
      <ul>
        {#each form?.issues as { message, path }}
          <li class="pl-4">- {path[0]} - {message}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <form method="POST" use:enhance class="space-y-6">
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
              <input type="radio" name="type" value={lobbyType.id} />
              <span class="text-lg text-gray-800">{lobbyType.label}</span>
            </div>
            <p class="text-gray-700">{lobbyType.description}</p>
          </label>
        {/each}
      </div>
    </div>

    <Button type="submit">
      Registreren
    </Button>
  </form>
</div>
