<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import '@fontsource-variable/source-sans-3';
  import '../app.css';

  let { children } = $props();
</script>

<nav class="px-6 py-3.5 border-b border-gray-300 mb-8">
  <div class="container max-w-320 mx-auto flex items-center justify-between">
    <a href="/" class="mr-8">
      <p class="text-gov-blue text-2xl font-semibold">Lobbyregister</p>
      <p role="doc-subtitle" class="text-sm leading-tight text-gray-600 max-sm:hidden">
        Transparantie in belangenbehartiging
      </p>
    </a>
    <div class="text-lg flex gap-10 items-center">
      <a class="text-gray-700 hover:text-gray-900 max-lg:hidden" href="/afspraken">Afspraken</a>
      <a class="text-gray-700 hover:text-gray-900 max-lg:hidden" href="/organisaties">
        Organisaties
      </a>
      <a class="text-gray-700 hover:text-gray-900 max-sm:hidden" href="/aanmelden">Aanmelden</a>
      <Button variant="link" href="/registreren">
        Registreren
      </Button>
    </div>
  </div>
</nav>

<div class="px-6">
  <div class="container max-w-320 mx-auto">
    <div class="mb-16 bg-yellow-100 text-yellow-800 px-6 sm:px-8 py-4 sm:py-5">
      <strong class="font-semibold">Let op:</strong>
      Dit is een demonstratie van een lobbyregister, ontwikkeld door
      <a href="//openstate.eu/nl" target="_blank" class="font-medium hover:underline">
        Open State Foundation
      </a>. Alle informatie is fictief.
    </div>

    <main>
      {@render children()}
    </main>
  </div>
</div>

<footer class="mt-20 py-12 px-6 border-t border-gray-300">
  <div class="container max-w-320 mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center space-x-2 mb-4 md:mb-0">
        <p class="text-gray-700 text-xl font-semibold">Lobbyregister</p>
        <span class="text-gray-400">|</span>
        <p class="text-gray-600 text-sm">Transparantie in belangenbehartiging</p>
      </div>
      <div class="text-gray-500 text-sm">
        <p>
          Deze demo werd ontwikkeld door
          <a
            href="//openstate.eu/nl"
            class="text-gray-700 font-medium hover:underline"
            target="_blank">Open State Foundation</a
          >.
        </p>
      </div>
    </div>
  </div>
</footer>
