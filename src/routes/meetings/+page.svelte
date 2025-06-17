<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let showMeetingForm = $state(false);
  let selectedLobbyists = $state<string[]>([]);

  let consultantLobbyists = $derived(
    selectedLobbyists
      .map((lobbyistId) => {
        const lobbyist = data.lobbyists.find((l) => l.id === lobbyistId);
        if (!lobbyist) return null;
        const organization = data.organizations.find((o) => o.id === lobbyist.organization_id);
        if (!organization || organization.type !== 'consultant') return null;
        return { lobbyist, organization };
      })
      .filter((item) => item !== null),
  );

  function handleLobbyistChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const lobbyistId = target.value;

    if (target.checked) {
      selectedLobbyists = [...selectedLobbyists, lobbyistId];
    } else {
      selectedLobbyists = selectedLobbyists.filter((id) => id !== lobbyistId);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes} minuten`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'uur' : 'uren'}`;
      } else {
        return `${hours} uur ${remainingMinutes} minuten`;
      }
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Afsprakenbeheer</h1>
    <a href="/" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      ← Terug naar hoofdpagina
    </a>
  </div>

  {#if form?.message}
    <div
      class="mb-4 p-4 {form.success
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'} rounded"
    >
      {form.message}
    </div>
  {/if}

  <!-- Maak afspraak knop -->
  <div class="mb-8">
    <button
      onclick={() => (showMeetingForm = !showMeetingForm)}
      class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
    >
      {showMeetingForm ? 'Verberg' : 'Registreer'} nieuwe afspraak
    </button>
  </div>

  <!-- Afspraakformulier -->
  {#if showMeetingForm}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Registreer nieuwe afspraak</h2>
      <form method="POST" action="?/createMeeting" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Afspraakdetails -->
          <div class="space-y-4">
            <div>
              <label for="meeting_date" class="block text-sm font-medium mb-1">
                Afspraakdatum
              </label>
              <input
                type="date"
                name="date"
                id="meeting_date"
                required
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label for="duration_minutes" class="block text-sm font-medium mb-1">
                Duur (minuten)
              </label>
              <input
                type="number"
                name="duration_minutes"
                id="duration_minutes"
                required
                min="1"
                max="1440"
                placeholder="bijv. 60"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label for="type" class="block text-sm font-medium mb-1">Afspraaktype</label>
              <select name="type" id="type" required class="w-full p-2 border rounded">
                <option value="">Selecteer type...</option>
                <option value="in_person">Persoonlijk</option>
                <option value="phone_call">Telefoongesprek</option>
                <option value="video_call">Videogesprek</option>
              </select>
            </div>

            <div>
              <label for="location" class="block text-sm font-medium mb-1">
                Locatie (optioneel)
              </label>
              <input
                type="text"
                name="location"
                id="location"
                class="w-full p-2 border rounded"
                placeholder="Afspraaklocatie of platform"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium mb-1">Beschrijving</label>
              <textarea
                name="description"
                id="description"
                required
                class="w-full p-2 border rounded h-24"
                placeholder="Afspraakagenda en onderwerpen"
              ></textarea>
            </div>
          </div>

          <!-- Deelnemers -->
          <div class="space-y-4">
            <!-- Overheidsfunctionarissen -->
            <div>
              <label class="block text-sm font-medium mb-2">Overheidsfunctionarissen (verplicht)</label>
              <div class="max-h-32 overflow-y-auto border rounded p-2 bg-white">
                {#each data.officials as official}
                  <label class="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      name="official_ids"
                      value={official.id}
                      class="rounded"
                    />
                    <span class="text-sm">
                      {official.name} - {official.function} ({official.department})
                    </span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Lobbyisten -->
            <div>
              <label class="block text-sm font-medium mb-2">Lobbyisten (verplicht)</label>
              <div class="max-h-32 overflow-y-auto border rounded p-2 bg-white">
                {#each data.lobbyists as lobbyist}
                  {@const org = data.organizations.find((o) => o.id === lobbyist.organization_id)}
                  <label class="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      name="lobbyist_ids"
                      value={lobbyist.id}
                      class="rounded"
                      onchange={handleLobbyistChange}
                    />
                    <span class="text-sm">
                      {lobbyist.name} - {lobbyist.function}
                      {#if org}
                        ({org.name}, {org.type})
                      {/if}
                    </span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Cliëntvertegenwoordigingen (alleen voor externe lobbyisten) -->
            {#if consultantLobbyists.length > 0}
              <div>
                <label class="block text-sm font-medium mb-2">
                  Cliëntvertegenwoordigingen (optioneel)
                </label>
                <p class="text-xs text-gray-600 mb-2">
                  Voor elke externe lobbyist: specificeer welke cliënten zij vertegenwoordigen in deze afspraak
                </p>
                <div class="max-h-40 overflow-y-auto border rounded p-2 bg-white space-y-3">
                  {#each consultantLobbyists as { lobbyist, organization }}
                    {@const availableRepresentations = data.representatives.filter(
                      (rep) => rep.representative_id === organization?.id,
                    )}
                    {#if availableRepresentations.length > 0}
                      <div class="border-l-2 border-blue-200 pl-3">
                        <div class="text-sm font-medium text-gray-700 mb-1">
                          {lobbyist.name} ({organization?.name}) kan vertegenwoordigen:
                        </div>
                        {#each availableRepresentations as rep}
                          {@const client = data.organizations.find((o) => o.id === rep.client_id)}
                          {#if client}
                            <label class="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                name="representations"
                                value="{lobbyist.id}:{rep.id}"
                                class="rounded"
                              />
                              <span class="text-sm">{client.name}</span>
                            </label>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <button
          type="submit"
          class="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Registreer afspraak
        </button>
      </form>
    </div>
  {/if}

  <!-- Afsprakenlijst -->
  <div>
    <h2 class="text-2xl font-semibold mb-4">Geregistreerde afspraken</h2>
    <div class="space-y-6">
      {#each data.meetings as meeting}
        <div class="border rounded-lg p-6 bg-white">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold">{meeting.description}</h3>
              <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                {#if meeting.date}
                  <span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                    📅 {formatDate(meeting.date)}
                  </span>
                {/if}
                {#if meeting.duration_minutes}
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    ⏱️ {formatDuration(meeting.duration_minutes)}
                  </span>
                {/if}
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {meeting.type.replace('_', ' ')}
                </span>
                {#if meeting.location}
                  <span>📍 {meeting.location}</span>
                {/if}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Overheidsfunctionarissen -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Overheidsfunctionarissen</h4>
              <div class="space-y-1">
                {#each data.meetingOfficials.filter((mo) => mo.meeting_id === meeting.id) as meetingOfficial}
                  {#if meetingOfficial.official}
                    <div class="text-sm bg-green-50 p-2 rounded">
                      <div class="font-medium">{meetingOfficial.official.name}</div>
                      <div class="text-gray-600">
                        {meetingOfficial.official.function} - {meetingOfficial.official.department}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>

            <!-- Lobbyisten -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Lobbyisten</h4>
              <div class="space-y-2">
                {#each data.meetingLobbyists.filter((ml) => ml.meeting_id === meeting.id) as meetingLobbyist}
                  {#if meetingLobbyist.lobbyist && meetingLobbyist.organization}
                    <div class="text-sm bg-purple-50 p-2 rounded">
                      <div class="font-medium">{meetingLobbyist.lobbyist.name}</div>
                      <div class="text-gray-600">{meetingLobbyist.lobbyist.function}</div>
                      <div class="text-gray-600">
                        {meetingLobbyist.organization.name} ({meetingLobbyist.organization.type})
                      </div>

                      <!-- Toon cliëntvertegenwoordigingen voor externe lobbyisten -->
                      {#if meetingLobbyist.organization.type === 'consultant'}
                        {@const representations = data.meetingRepresentations.filter(
                          (mr) => mr.meeting_lobbyist_id === meetingLobbyist.id,
                        )}
                        {#if representations.length > 0}
                          <div class="mt-2 ml-2">
                            <div class="text-xs font-medium text-gray-700">Vertegenwoordigt:</div>
                            {#each representations as rep}
                              {#if rep.client}
                                <div class="text-xs text-gray-600 ml-2">• {rep.client.name}</div>
                              {/if}
                            {/each}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if data.meetings.length === 0}
        <div class="text-center py-8 text-gray-500">
          Nog geen afspraken geregistreerd. Registreer je eerste afspraak hierboven.
        </div>
      {/if}
    </div>
  </div>
</div>
