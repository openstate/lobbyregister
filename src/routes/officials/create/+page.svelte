<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Nieuwe overheidsfunctionaris registreren</h1>
    <a href="/" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      ← Terug naar hoofdpagina
    </a>
  </div>

  {#if form?.message}
    <div
      class="mb-4 p-4 {'success' in form && form.success
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'} rounded"
    >
      {form.message}
    </div>
  {/if}

  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Functionaris gegevens</h2>
    <form method="POST" action="?/createOfficial" use:enhance>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="official_name" class="block text-sm font-medium mb-1">Naam</label>
          <input
            type="text"
            name="name"
            id="official_name"
            required
            class="w-full p-2 border rounded"
            placeholder="Voornaam Achternaam"
          />
        </div>

        <div>
          <label for="official_function" class="block text-sm font-medium mb-1">Functie</label>
          <input
            type="text"
            name="function"
            id="official_function"
            required
            class="w-full p-2 border rounded"
            placeholder="bijv. Minister, Staatssecretaris, Directeur"
          />
        </div>

        <div>
          <label for="department" class="block text-sm font-medium mb-1">Departement</label>
          <input
            type="text"
            name="department"
            id="department"
            required
            class="w-full p-2 border rounded"
            placeholder="bijv. Ministerie van Economische Zaken"
          />
        </div>
      </div>

      <button
        type="submit"
        class="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Registreer functionaris
      </button>
    </form>
  </div>

  <!-- Information section -->
  <div class="mt-8 bg-blue-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold mb-3 text-blue-800">📋 Informatie</h3>
    <ul class="space-y-2 text-blue-700">
      <li>• Na registratie kun je de gegevens van de functionaris bewerken</li>
      <li>• Functionarissen kunnen deelnemen aan lobbygesprekken</li>
      <li>• Alle geregistreerde functionarissen zijn zichtbaar in het overzicht</li>
    </ul>
  </div>
</div>
