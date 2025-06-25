<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const { data } = $props();

  // Search states for filter lists
  let officialSearch = $state('');
  let lobbyistSearch = $state('');
  let organizationSearch = $state('');
  let policyAreaSearch = $state('');

  // Filtered lists based on search
  const filteredOfficials = $derived(
    data.filterOptions.officials.filter(
      (official) =>
        official.name.toLowerCase().includes(officialSearch.toLowerCase()) ||
        official.department.toLowerCase().includes(officialSearch.toLowerCase()),
    ),
  );

  const filteredLobbyists = $derived(
    data.filterOptions.lobbyists.filter(
      (lobbyist) =>
        lobbyist.name.toLowerCase().includes(lobbyistSearch.toLowerCase()) ||
        (lobbyist.organization_name &&
          lobbyist.organization_name.toLowerCase().includes(lobbyistSearch.toLowerCase())),
    ),
  );

  const filteredOrganizations = $derived(
    data.filterOptions.organizations.filter((organization) =>
      organization.name.toLowerCase().includes(organizationSearch.toLowerCase()),
    ),
  );

  const filteredPolicyAreas = $derived(
    data.filterOptions.policyAreas.filter((area) =>
      area.toLowerCase().includes(policyAreaSearch.toLowerCase()),
    ),
  );

  function updateFilter(params: URLSearchParams | null) {
    goto(`/afspraken?${params?.toString() ?? ''}`, { replaceState: true });
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

    // Add checkbox arrays
    const officials = formData.getAll('official');
    officials.forEach((id) => {
      if (id && id.toString().trim()) {
        searchParams.append('official', id.toString());
      }
    });

    const lobbyists = formData.getAll('lobbyist');
    lobbyists.forEach((id) => {
      if (id && id.toString().trim()) {
        searchParams.append('lobbyist', id.toString());
      }
    });

    const organizations = formData.getAll('organization');
    organizations.forEach((id) => {
      if (id && id.toString().trim()) {
        searchParams.append('organization', id.toString());
      }
    });

    const policyAreas = formData.getAll('policy_area');
    policyAreas.forEach((area) => {
      if (area && area.toString().trim()) {
        searchParams.append('policy_area', area.toString());
      }
    });

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

  // Meeting type labels
  const meetingTypeLabels: Record<string, string> = {
    in_person: 'Fysiek gesprek',
    phone_call: 'Telefoongesprek',
    video_call: 'Videogesprek',
  };

  // Check if any filters are active
  const activeFiltersCount = $derived(
    (data.filters.search ? 1 : 0) +
      data.filters.officialIds.length +
      data.filters.lobbyistIds.length +
      data.filters.organizationIds.length +
      data.filters.policyAreas.length +
      (data.filters.meetingType ? 1 : 0),
  );

  const hasActiveFilters = $derived(activeFiltersCount > 0);
</script>

<div class="my-8">
  <h1 class="text-3xl font-semibold text-gray-800 mb-4">Afspraken</h1>
  <p class="text-xl text-gray-700">
    Overzicht van alle geregistreerde afspraken tussen lobbyisten en overheidsfunctionarissen.
  </p>
</div>

<div class="flex flex-col lg:flex-row gap-8">
  <!-- Filters sidebar -->
  <div class="lg:w-80 flex-shrink-0">
    <div class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto p-1 -m-1">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Filters</h2>

      <form onsubmit={handleFilterSubmit} class="space-y-4">
        <!-- Search field -->
        <div>
          <label for="search" class="block font-medium text-gray-700 mb-2">
            Zoeken in beschrijving
          </label>
          <input
            id="search"
            name="search"
            type="text"
            value={data.filters.search}
            placeholder="Zoek in afspraakbeschrijving..."
            class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
          />
        </div>

        <!-- Meeting type filter -->
        <div>
          <label for="type" class="block font-medium text-gray-700 mb-2"> Type afspraak </label>
          <select
            id="type"
            name="type"
            class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
          >
            <option value="">Alle types</option>
            {#each data.filterOptions.meetingTypes as type}
              <option value={type.value} selected={data.filters.meetingType === type.value}>
                {type.label}
              </option>
            {/each}
          </select>
        </div>

        <!-- Official filter -->
        <div>
          <details class="group">
            <summary
              class="flex items-center justify-between cursor-pointer font-medium text-gray-800 group-open:mb-2"
            >
              <span>
                Functionarissen
                {#if data.filters.officialIds.length > 0}
                  <span class="font-normal">
                    ({data.filters.officialIds.length} filter{data.filters.officialIds.length === 1
                      ? ''
                      : 's'})
                  </span>
                {/if}
              </span>
              <span class="not-group-open:-rotate-90 not-group-open:-translate-x-1 text-lg">⌄</span>
            </summary>
            <div class="border border-gray-200 bg-white">
              <div class="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Zoek functionaris..."
                  bind:value={officialSearch}
                  class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
                />
              </div>
              <div class="max-h-48 overflow-y-auto">
                {#each filteredOfficials as official}
                  <label class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="official"
                      value={official.id}
                      checked={data.filters.officialIds.includes(official.id)}
                      class="mr-3 text-gov-blue focus:ring-gov-blue"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-gray-900 truncate">{official.name}</div>
                      <div class="text-gray-600 truncate">{official.department}</div>
                    </div>
                  </label>
                {/each}
                {#if filteredOfficials.length === 0}
                  <div class="px-3 py-4 text-gray-500 text-center">
                    Geen functionarissen gevonden
                  </div>
                {/if}
              </div>
            </div>
          </details>
        </div>

        <!-- Lobbyist filter -->
        <div>
          <details class="group">
            <summary
              class="flex items-center justify-between cursor-pointer font-medium text-gray-800 group-open:mb-2"
            >
              <span>
                Lobbyisten
                {#if data.filters.lobbyistIds.length > 0}
                  <span class="font-normal">
                    ({data.filters.lobbyistIds.length} filter{data.filters.lobbyistIds.length === 1
                      ? ''
                      : 's'})
                  </span>
                {/if}
              </span>
              <span class="not-group-open:-rotate-90 not-group-open:-translate-x-1 text-lg">⌄</span>
            </summary>
            <div class="border border-gray-200 bg-white">
              <div class="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Zoek lobbyist..."
                  bind:value={lobbyistSearch}
                  class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
                />
              </div>
              <div class="max-h-48 overflow-y-auto">
                {#each filteredLobbyists as lobbyist}
                  <label class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="lobbyist"
                      value={lobbyist.id}
                      checked={data.filters.lobbyistIds.includes(lobbyist.id)}
                      class="mr-3 text-gov-blue focus:ring-gov-blue"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-gray-900 truncate">{lobbyist.name}</div>
                      <div class="text-gray-600 truncate">{lobbyist.organization_name}</div>
                    </div>
                  </label>
                {/each}
                {#if filteredLobbyists.length === 0}
                  <div class="px-3 py-4 text-gray-500 text-center">Geen lobbyisten gevonden</div>
                {/if}
              </div>
            </div>
          </details>
        </div>

        <!-- Organization filter -->
        <div>
          <details class="group">
            <summary
              class="flex items-center justify-between cursor-pointer font-medium text-gray-800 group-open:mb-2"
            >
              <span>
                Organisaties
                {#if data.filters.organizationIds.length > 0}
                  <span class="font-normal">
                    ({data.filters.organizationIds.length} filter{data.filters.organizationIds
                      .length === 1
                      ? ''
                      : 's'})
                  </span>
                {/if}
              </span>
              <span class="not-group-open:-rotate-90 not-group-open:-translate-x-1 text-lg">⌄</span>
            </summary>
            <div class="border border-gray-200 bg-white">
              <div class="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Zoek organisatie..."
                  bind:value={organizationSearch}
                  class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
                />
              </div>
              <div class="max-h-48 overflow-y-auto">
                {#each filteredOrganizations as organization}
                  <label class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="organization"
                      value={organization.id}
                      checked={data.filters.organizationIds.includes(organization.id)}
                      class="mr-3 text-gov-blue focus:ring-gov-blue"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-gray-900 truncate">{organization.name}</div>
                    </div>
                  </label>
                {/each}
                {#if filteredOrganizations.length === 0}
                  <div class="px-3 py-4 text-gray-500 text-center">Geen organisaties gevonden</div>
                {/if}
              </div>
            </div>
          </details>
        </div>

        <!-- Policy Area filter -->
        <div>
          <details class="group">
            <summary
              class="flex items-center justify-between cursor-pointer font-medium text-gray-800 group-open:mb-2"
            >
              <span>
                Beleidsterreinen
                {#if data.filters.policyAreas.length > 0}
                  <span class="font-normal">
                    ({data.filters.policyAreas.length} filter{data.filters.policyAreas.length === 1
                      ? ''
                      : 's'})
                  </span>
                {/if}
              </span>
              <span class="not-group-open:-rotate-90 not-group-open:-translate-x-1 text-lg">⌄</span>
            </summary>
            <div class="border border-gray-200 bg-white">
              <div class="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Zoek beleidsterrein..."
                  bind:value={policyAreaSearch}
                  class="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-2 outline-offset-1 focus:outline-gov-blue"
                />
              </div>
              <div class="max-h-48 overflow-y-auto">
                {#each filteredPolicyAreas as area}
                  <label class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="policy_area"
                      value={area}
                      checked={data.filters.policyAreas.includes(area)}
                      class="mr-3 text-gov-blue focus:ring-gov-blue"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-gray-900 truncate">{area}</div>
                    </div>
                  </label>
                {/each}
                {#if filteredPolicyAreas.length === 0}
                  <div class="px-3 py-4 text-gray-500 text-center">
                    Geen beleidsterreinen gevonden
                  </div>
                {/if}
              </div>
            </div>
          </details>
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
        {data.pagination.totalCount === 1 ? 'afspraak' : 'afspraken'} gevonden
        {#if hasActiveFilters}
          <span class="text-gray-500">
            met {activeFiltersCount} actieve filter{activeFiltersCount === 1 ? '' : 's'}
          </span>
        {/if}
      </p>

      {#if hasActiveFilters}
        <div class="mt-2 flex flex-wrap gap-2">
          {#if data.filters.search}
            {@render filterCard(`Zoekterm: "${data.filters.search}"`, 'search')}
          {/if}
          {#if data.filters.meetingType}
            {@render filterCard(`Type: ${meetingTypeLabels[data.filters.meetingType]}`, 'type')}
          {/if}
          {#if data.filters.officialIds.length > 0}
            {@render filterCard(
              `${data.filters.officialIds.length} functionaris${data.filters.officialIds.length === 1 ? '' : 'sen'}`,
              'official',
            )}
          {/if}
          {#if data.filters.lobbyistIds.length > 0}
            {@render filterCard(
              `${data.filters.lobbyistIds.length} lobbyist${data.filters.lobbyistIds.length === 1 ? '' : 'en'}`,
              'lobbyist',
            )}
          {/if}
          {#if data.filters.organizationIds.length > 0}
            {@render filterCard(
              `${data.filters.organizationIds.length} organisatie${data.filters.organizationIds.length === 1 ? '' : 's'}`,
              'organization',
            )}
          {/if}
          {#if data.filters.policyAreas.length > 0}
            {@render filterCard(
              `${data.filters.policyAreas.length} beleidsterrein${data.filters.policyAreas.length === 1 ? '' : 'en'}`,
              'policy_area',
            )}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Meetings list -->
    {#if data.meetings.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">
          {#if hasActiveFilters}
            Geen afspraken gevonden met de huidige filters.
          {:else}
            Geen afspraken gevonden.
          {/if}
        </p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each data.meetings as meeting}
          <div class="border border-gray-300 p-6">
            <div class="mb-2">
              <a
                href="/afspraken/{meeting.id}"
                class="text-xl font-medium text-gov-blue hover:underline leading-tight inline-block mb-2"
              >
                {meeting.description}
              </a>

              <div class="flex flex-wrap gap-2 text-gray-600 mb-3">
                <span>
                  Afspraak op {new Date(meeting.date).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                ·
                <span>{meetingTypeLabels[meeting.type]}</span>
                {#if meeting.location}
                  ·
                  <span>{meeting.location}</span>
                {/if}
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              {#if meeting.officials.length > 0}
                <div>
                  <h4 class="font-medium text-gray-700 mb-1">Functionarissen</h4>
                  <ul>
                    {#each meeting.officials as official}
                      <li class="text-gray-600 line-clamp-1">
                        {official.name} ({official.department})
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if meeting.lobbyists.length > 0}
                <div>
                  <h4 class="font-medium text-gray-700 mb-1">Lobbyisten</h4>
                  <ul>
                    {#each meeting.lobbyists as lobbyist}
                      <li class="text-gray-600 line-clamp-1">
                        {lobbyist.name} ({lobbyist.organization.name})
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
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
