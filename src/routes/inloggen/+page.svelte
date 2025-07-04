<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { enhance } from '$app/forms';

  const { data, form } = $props();
</script>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Inloggen</h2>


  {#if form?.message}
    <div class="mb-6 p-4 bg-red-100 text-red-700 border border-red-200">
      {form.message}
    </div>
  {/if}

    <form method="POST" use:enhance class="space-y-6">
      {#if data.fromPage}
        <input type="hidden" id="fromPage" name="fromPage" value={data.fromPage} />
      {/if}
    <div>
      <label for="username" class="block text-lg font-medium text-gray-800 mb-2">
        Gebruikersnaam <em>(in deze demo een eenvoudige dropdown)</em>
      </label>
      <select
        name="username"
        id="username"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
      >
        <option value="">Selecteer gebruiker...</option>
        {#each data.users as user}
          <option value={user.id}>{user.name}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="password" class="block text-lg font-medium text-gray-800 mb-2">
        Wachtwoord
      </label>
      <input
        type="password"
        name="password"
        id="password"
        required
        class="w-full text-lg bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
        placeholder="Geef uw wachtwoord op"
      />
    </div>
    <Button type="submit">
      Inloggen
    </Button>
    </form>
</div>
