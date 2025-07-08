<script lang="ts">
  import { enhance } from '$app/forms';
  import { SBI_CODES } from '$lib/constants';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import FormMessages from '$lib/components/FormMessages.svelte';
  import AddSvg from '$lib/icons/AddSvg.svelte';
  import RemoveSvg from '$lib/icons/RemoveSvg.svelte';
  import { LOBBY_TYPES } from '../../../../types.js';

  let { form, data } = $props();
  let lobbyists = $state(data.lobbyists);

  function lobbyistNameId(index: number) {
    return `lobbyistName_${index}`;
  }

  function lobbyistFunctionId(index: number) {
    return `lobbyistFunction_${index}`;
  }

  function addLobbyist() {
    lobbyists.push({id: '', name: undefined, function: undefined});
  }

  function removeLobbyist(index: number) {
    lobbyists.splice(index, 1);
  }

  function enHanceForm(formData: FormData) {
    formData.append('lobbyists', JSON.stringify(lobbyists));
  }

  const lobbyistColumns = "45%_45%_10%";
</script>

<div class="flex flex-wrap gap-x-16 gap-y-4 justify-between items-start mb-8">
  <h1 class="text-3xl font-semibold text-gray-800 mb-3 max-w-5xl line-clamp-1">Lobbyorganisatie bewerken</h1>
  <div class="flex flex-wrap gap-x-8 gap-y-4 items-center">
    <button
      onclick={() => (history.length > 1 ? history.back() : goto('/'))}
      class="text-gov-blue hover:text-gov-dark-blue hover:underline text-lg my-1 cursor-pointer"
    >
      ← Terug
    </button>
  </div>
</div>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Basisdata bewerken</h2>

  <FormMessages message={form?.message} issues={form?.issues} />

  <form method="POST" use:enhance={({formData}) => enHanceForm(formData)} class="space-y-6">
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
        value={data.organization.name}
      />
    </div>

    <div>
      <label for="city" class="block text-lg font-medium text-gray-800 mb-2">
        Plaats
      </label>
      <input
        type="text"
        name="city"
        id="city"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        value={data.organization.city}
      />
    </div>

    <div>
      <label for="website" class="block text-lg font-medium text-gray-800 mb-2">
        Website
      </label>
      <input
        type="text"
        name="website"
        id="website"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        value={data.organization.website}
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
        value={data.organization.kvk_number}
      />
      <label class="flex items-center gap-2 mt-2 text-lg">
        <input
          type="checkbox"
          name="no_kvk"
          id="no_kvk"
          class="focus:outline-2 outline-offset-1 focus:outline-gov-blue size-4"
          checked={!data.organization.kvk_number}
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
          <option value={sbiCode} selected={data.organization.sector == sbiCode}>{label}</option>
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
              <input type="radio" name="type" value={lobbyType.id} checked={data.organization.type == lobbyType.id} />
              <span class="text-lg text-gray-800">{lobbyType.label}</span>
            </div>
            <p class="text-gray-700">{lobbyType.description}</p>
          </label>
        {/each}
      </div>
    </div>

    <h2 class="font-semibold text-gray-800 text-2xl mb-6 mt-12">Lobbyisten bewerken</h2>
    <div class="@container space-y-4">
      <div class="grid grid-cols-[{lobbyistColumns}] gap-4 mb-1">
        <div>
          <label class="block text-lg font-medium text-gray-800">
            Naam
          </label>
        </div>
        <div>
          <label class="block text-lg font-medium text-gray-800">
            Function
          </label>
        </div>
        <div></div>
      </div>
      {#each lobbyists as lobbyist, index }
        <div class="grid grid-cols-[{lobbyistColumns}] gap-4 mb-1">
          <div>
            <input
              type="text"
              name={lobbyistNameId(index)}
              id={lobbyistNameId(index)}
              required
              class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
              bind:value={lobbyist.name}
              placeholder="Vul de naam van de lobbyist in"
            />
          </div>
          <div>
            <input
              type="text"
              name={lobbyistFunctionId(index)}
              id={lobbyistFunctionId(index)}
              required
              class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
              bind:value={lobbyist.function}
              placeholder="Vul de functie van de lobbyist in"
            />
          </div>
          <div>
            <a
              onclick="{() => removeLobbyist(index)}"
              title="Lobbyist verwijderen">
              <RemoveSvg class="w-12 h-12 stroke-red-600 cursor-pointer" />
            </a>
          </div>
        </div>
      {/each}
      <div class="">
        <a
           onclick="{addLobbyist}"
           title="Lobbyist toevoegen">
          <AddSvg class="w-12 stroke-gov-blue cursor-pointer" />
        </a>
      </div>
    </div>

    <Button type="submit" class="mt-12">
      Opslaan
    </Button>
  </form>
</div>
