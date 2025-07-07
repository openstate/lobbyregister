<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Button.svelte';
</script>

<div class="mx-auto max-w-2xl md:mb-32">
  <h2 class="font-semibold text-gray-800 text-2xl mb-6">Registreren</h2>
  <form method="POST" use:enhance>
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <label
        class="border border-gray-300 px-6 py-5 cursor-pointer hover:bg-gray-50 has-checked:bg-gov-light-blue has-checked:border-gov-blue"
      >
        <div class="flex items-center gap-2 mb-1">
          <input type="radio" name="type" value="official" class="w-4 h-4" />
          <span class="text-xl font-medium text-gray-800">Overheidsfunctionaris</span>
        </div>
        <p class="text-gray-700">
          Ik vertegenwoordig een bewindspersoon of topambtenaar.
        </p>
      </label>
      <label
        class="border border-gray-300 px-6 py-5 cursor-pointer hover:bg-gray-50 has-checked:bg-gov-light-blue has-checked:border-gov-blue"
      >
        <div class="flex items-center gap-2 mb-1">
          <input type="radio" name="type" value="lobbyist" class="w-4 h-4" />
          <span class="text-xl font-medium text-gray-800">Lobbyorganisatie</span>
        </div>
        <p class="text-gray-700">
          Ik vertegenwoordig een organisatie die belangen behartigt bij de overheid.
        </p>
      </label>
    </div>
    <Button type="submit">
      Volgende stap
    </Button>
  </form>
</div>
