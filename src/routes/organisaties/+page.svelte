<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { meetingTypeLabels, searchCategoryTexts, searchCategoryTypes } from '../../types.js';
  import { toast } from '@zerodevx/svelte-toast'
  import { organizationTypeLabels } from '../../types.js';
  import { getSectorName } from '../../utils/organizationUtils.js';

  const { data } = $props();

  // Search states for filter lists
  let officialSearch = $state('');
  let lobbyistSearch = $state('');
  let organizationSearch = $state('');
  let policyAreaSearch = $state('');
  let searchMeetings = $state(true);
  let searchOrganizations = $state(false);
  let searchLobbyists = $state(false);

  // // Filtered lists based on search
  // const filteredOfficials = $derived(
  //   data.filterOptions.officials.filter(
  //     (official) =>
  //       official.name.toLowerCase().includes(officialSearch.toLowerCase()) ||
  //       official.department.toLowerCase().includes(officialSearch.toLowerCase()),
  //   ),
  // );

  // const filteredLobbyists = $derived(
  //   data.filterOptions.lobbyists.filter(
  //     (lobbyist) =>
  //       lobbyist.name.toLowerCase().includes(lobbyistSearch.toLowerCase()) ||
  //       (lobbyist.organization_name &&
  //         lobbyist.organization_name.toLowerCase().includes(lobbyistSearch.toLowerCase())),
  //   ),
  // );

  // const filteredOrganizations = $derived(
  //   data.filterOptions.organizations.filter((organization) =>
  //     organization.name.toLowerCase().includes(organizationSearch.toLowerCase()),
  //   ),
  // );

  // const filteredPolicyAreas = $derived(
  //   data.filterOptions.policyAreas.filter((area) =>
  //     area.toLowerCase().includes(policyAreaSearch.toLowerCase()),
  //   ),
  // );

  function updateFilter(params: URLSearchParams | null) {
    goto(`/organisaties?${params?.toString() ?? ''}`, { replaceState: true });
  }

  function searchCategoriesDescription(searchCategories: searchCategoryTypes[]) {
    return searchCategories.map((category) => searchCategoryTexts[category])
    .join(', ')
  }

  // Handle form submission for filters
  function handleFilterSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const searchParams = new URLSearchParams();

    // Add text fields
    const search = formData.get('search');
    if (search && search.toString().trim()) {
      searchParams.set('search', search.toString());
    }

    const type = formData.get('type');
    if (type && type.toString().trim()) {
      searchParams.set('type', type.toString());
    }

    // Reset to page 1 when filtering
    searchParams.set('page', '1');

    updateFilter(searchParams);
  }

  // Handle pagination
  function goToPage(pageNum: number) {
    const searchParams = new URLSearchParams($page.url.searchParams);
    searchParams.set('page', pageNum.toString());
    updateFilter(searchParams);
  }

  // Check if any filters are active
  const activeFiltersCount = $derived(
    (data.filters.search ? 1 : 0) +
      (data.filters.organizationType ? 1 : 0),
  );

  const hasActiveFilters = $derived(activeFiltersCount > 0);
</script>

<div class="my-8">
  <div class="flex items-center justify-between mb-4">
  <h1 class="text-3xl font-semibold text-gray-800">Lobbyorganisaties</h1>
  <!-- <form action="/afspraken/toevoegen">
    <Button type="submit">Toevoegen</Button>
  </form> -->

  </div>
  <p class="text-xl text-gray-700">
    Overzicht van alle geregistreerde lobbyorganisaties.
  </p>
</div>

<div class="flex flex-col lg:flex-row gap-8">
  <!-- Filters sidebar -->
  <div class="lg:w-80 flex-shrink-0">
    <div class="sticky top-4 max-h-[calc(150vh-2rem)] overflow-y-auto p-1 -m-1">
      <form onsubmit={handleFilterSubmit} class="space-y-4">
          <!-- Search field -->
        <div>
          <label for="search" class="block font-medium text-gray-700 mb-2">
            Zoekterm
          </label>
          <input
            id="search"
            name="search"
            type="text"
            value={data.filters.search}
            placeholder="Vul zoekterm in..."
            class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
          />
        </div>

        <h2 class="text-xl font-medium text-gray-800 mb-4">Filters</h2>

        <!-- Organization type filter -->
        <div>
          <label for="type" class="block font-medium text-gray-700 mb-2"> Type lobbyorganisatie </label>
          <select
            id="type"
            name="type"
            class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
          >
            <option value="">Alle types</option>
            {#each Object.entries(data.filterOptions.organizationTypes) as type}
              <option value={type[0]} selected={data.filters.organizationType === type[0]}>
                {type[1]}
              </option>
            {/each}
          </select>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <Button type="submit">Filteren</Button>
          {#if hasActiveFilters}
            <button
              type="button"
              onclick={() => updateFilter(null)}
              class="w-full text-gov-blue hover:underline py-1 cursor-pointer"
            >
              Alle filters wissen
            </button>
          {/if}
        </div>
      </form>
    </div>
  </div>

  <!-- Main content -->
  <div class="flex-1 min-w-0">
    <!-- Results summary -->
    <div class="mb-6">
      <p class="text-gray-600">
        {data.pagination.totalCount}
        {data.pagination.totalCount === 1 ? 'lobbyorganisatie' : 'lobbyorganisaties'} gevonden
        {#if hasActiveFilters}
          <span class="text-gray-500">
            met {activeFiltersCount} actieve filter{activeFiltersCount === 1 ? '' : 's'}
          </span>
        {/if}
        {#if data.pagination.totalCount > 0}
        <a href="." 
           onclick="{(event) => {
            toast.push("Deze demo versie bevat nog geen mogelijkheid om de resultaten te downloaden", {duration: 10000});
            event.preventDefault();
           }}"
           title="Resultaten downloaden">
          <img src="/download.svg" alt="Resultaten downloaden" class="w-8 inline ml-4" />
        </a>
        {/if}
      </p>

      {#if hasActiveFilters}
        <div class="mt-2 flex flex-wrap gap-2">
          {#if data.filters.search}
            {@render filterCard(`Zoekterm: "${data.filters.search}"`, 'search')}
          {/if}
          {#if data.filters.organizationType}
            {@render filterCard(`Type: ${organizationTypeLabels[data.filters.organizationType]}`, 'type')}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Organizations list -->
    {#if data.organizations.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">
          {#if hasActiveFilters}
            Geen lobbyorganisaties gevonden met de huidige filters.
          {:else}
            Geen lobbyorganisaties gevonden.
          {/if}
        </p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each data.organizations as organization}
          <div class="border border-gray-300 p-6">
            <div class="mb-2">
              <a
                href="/organisaties/{organization.id}"
                class="text-xl font-medium text-gov-blue hover:underline leading-tight inline-block mb-2"
              >
                {organization.name}
              </a>

              <div class="flex flex-wrap gap-2 text-gray-600 mb-1">
                <span>{getSectorName(organization.sector)}</span>
              </div>
              <div class="flex flex-wrap gap-2 text-gray-600 mb-2">
                <span>{organization.city}</span>
                ·
                <span>KvK {organization.kvk_number}</span>
                ·
                <span>{organizationTypeLabels[organization.type]}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if data.pagination.totalPages > 1}
        <div class="mt-8 flex justify-center">
          <nav class="flex items-center gap-2">
            <!-- Previous button -->
            {#if data.pagination.hasPrev}
              <button
                onclick={() => goToPage(data.pagination.page - 1)}
                class="px-3 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer"
              >
                Vorige
              </button>
            {/if}

            <!-- Page numbers -->
            {#if true}
              {@const startPage = Math.max(1, data.pagination.page - 1)}
              {@const endPage = Math.min(data.pagination.totalPages, data.pagination.page + 1)}

              {#if startPage > 1}
                <button
                  onclick={() => goToPage(1)}
                  class="size-10 text-center border border-gray-300 cursor-pointer flex items-center justify-center"
                >
                  1
                </button>
                {#if startPage > 2}
                  <span class="px-2 text-gray-500">...</span>
                {/if}
              {/if}

              {#each Array(endPage - startPage + 1) as _, i}
                {@const pageNum = startPage + i}
                <button
                  onclick={() => goToPage(pageNum)}
                  class="size-10 text-center border border-gray-300 cursor-pointer flex items-center justify-center {pageNum ===
                  data.pagination.page
                    ? 'bg-gov-blue text-white'
                    : 'text-gray-800 hover:bg-gray-50'}"
                >
                  {pageNum}
                </button>
              {/each}

              {#if endPage < data.pagination.totalPages}
                {#if endPage < data.pagination.totalPages - 1}
                  <span class="px-2 text-gray-500">...</span>
                {/if}
                <button
                  onclick={() => goToPage(data.pagination.totalPages)}
                  class="size-10 text-center border border-gray-300 cursor-pointer flex items-center justify-center"
                >
                  {data.pagination.totalPages}
                </button>
              {/if}
            {/if}

            <!-- Next button -->
            {#if data.pagination.hasNext}
              <button
                onclick={() => goToPage(data.pagination.page + 1)}
                class="px-3 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer"
              >
                Volgende
              </button>
            {/if}
          </nav>
        </div>
      {/if}
    {/if}
  </div>
</div>

{#snippet filterCard(text: string, paramName: string)}
  <span class="inline-flex items-center px-2 py-1 bg-gov-light-blue text-gov-blue">
    {text}
    <button
      type="button"
      onclick={() => {
        const params = new URLSearchParams($page.url.searchParams);
        params.delete(paramName);
        updateFilter(params);
      }}
      class="ml-2 cursor-pointer hover:text-gov-blue-dark"
      aria-label="Verwijder filter"
    >
      ×
    </button>
  </span>
{/snippet}
