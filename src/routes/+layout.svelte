<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import '@fontsource-variable/source-sans-3';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import { toast } from '@zerodevx/svelte-toast';
  import Flash from '$lib/components/Flash.svelte';
  import { Hamburger } from 'svelte-hamburgers';

  import '../app.css';
  import type { AuthenticatedUserTypes } from '../types';
  import { fly } from 'svelte/transition';

  let { data, children } = $props();

  function labelForAuthenticatedUserType(type: AuthenticatedUserTypes) {
    switch (type) {
      case 'official':
        return 'gemeentefunctionaris';
      case 'lobbyist':
        return 'lobbyist';
    }
  }

  let menuIsOpen = $state(false);
  function resetOpenState() {
    menuIsOpen = !menuIsOpen;
  }
</script>

<SvelteToast />

<nav class="px-6 py-3.5 border-b border-gray-300 mb-8 main">
  <div class="container max-w-320 mx-auto flex items-center justify-between">
    <a href="/" class="mr-8 py-1.5">
      <img src="/gemeente-amsterdam.svg" alt="" width="120" />
    </a>
    <div class="md:hidden">
      <Hamburger
        bind:open={menuIsOpen}
        type="collapse"
        title="Toggle nav links"
        ariaControls="nav"
        --color="white"
      />
    </div>
    <div class="lg:text-lg md:text-sm flex lg:gap-10 md:gap-4 max-md:hidden items-center">
      <a class="text-gray-900 hover:text-black max-md:hidden" href="/afspraken">Afspraken</a>
      <a class="text-gray-900 hover:text-black max-md:hidden" href="/organisaties">
        Lobbyisten
      </a>
      <a class="text-gray-900 hover:text-black max-md:hidden" href="/faqs"> FAQs </a>
      <a
        class="text-gray-900 hover:text-black max-md:hidden"
        href="."
        onclick={(event) => {
          toast.push('Deze demo versie bevat nog geen API', { duration: 10000 });
          event.preventDefault();
        }}
      >
        API
      </a>
      {#if data.authenticatedUser}
        <form method="post" action="/uitloggen" class="inline">
          <input type="hidden" name="extra_submit_param" value="extra_submit_value" />
          <button
            type="submit"
            name="submit_param"
            value="submit_value"
            class="text-gray-900 hover:text-black max-md:hidden cursor-pointer"
          >
            Uitloggen
          </button>
        </form>
      {:else}
        <Button variant="link" href="/registreren" class="lg:text-lg md:text-sm max-md:hidden">
          Registreren
        </Button>
        <a class="text-gray-900 hover:text-black max-md:hidden" href="/inloggen">Inloggen</a>
      {/if}
    </div>
    {#if menuIsOpen}
      <ul id="nav" class="menu" transition:fly={{ y: -15 }}>
        <li><a href="/afspraken" onclick={resetOpenState}>Afspraken</a></li>
        <li><a href="/organisaties" onclick={resetOpenState}>Lobbyisten</a></li>
        <li><a href="/faqs" onclick={resetOpenState}>FAQs</a></li>
        <li>
          <a
            href="."
            onclick={(event) => {
              toast.push('Deze demo versie bevat nog geen API', { duration: 10000 });
              event.preventDefault();
              resetOpenState();
            }}
          >
            API
          </a>
        </li>
        {#if data.authenticatedUser}
          <form method="post" action="/uitloggen" class="inline">
            <input type="hidden" name="extra_submit_param" value="extra_submit_value" />
            <button type="submit" name="submit_param" value="submit_value" class="cursor-pointer">
              Uitloggen
            </button>
          </form>
        {:else}
          <li><a href="/registreren" onclick={resetOpenState}>Registreren</a></li>
          <li><a href="/inloggen" onclick={resetOpenState}>Inloggen</a></li>
        {/if}
      </ul>
    {/if}
  </div>
</nav>
{#if data.authenticatedUser}
  <div class="px-6 py-3.5 border-b border-gray-300 -mt-8 mb-8">
    <div class="container max-w-320 mx-auto text-right">
      <em
        >U bent ingelogd als {labelForAuthenticatedUserType(data.authenticatedUser.type)}
        {data.authenticatedUser.name}</em
      >
    </div>
  </div>
{/if}

<div class="px-6">
  <div class="container max-w-320 mx-auto">
    <div class="mb-8 bg-yellow-100 text-yellow-800 px-6 sm:px-8 py-4 sm:py-5">
      <strong class="font-semibold">Let op:</strong>
      Dit is een demonstratie van een lobbyregister, ontwikkeld door
      <a href="//openstate.eu/nl" target="_blank" class="font-bold underline">
        Open State Foundation
      </a>. Alle informatie is fictief.
    </div>

    <Flash />

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
            class="text-gray-700 font-bold underline"
            target="_blank">Open State Foundation</a
          >.
        </p>
      </div>
    </div>
  </div>
</footer>
