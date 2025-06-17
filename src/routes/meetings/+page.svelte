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
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Meeting Management</h1>
    <a href="/" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      ← Back to Main
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

  <!-- Create Meeting Button -->
  <div class="mb-8">
    <button
      onclick={() => (showMeetingForm = !showMeetingForm)}
      class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
    >
      {showMeetingForm ? 'Hide' : 'Schedule'} New Meeting
    </button>
  </div>

  <!-- Meeting Form -->
  {#if showMeetingForm}
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">Schedule New Meeting</h2>
      <form method="POST" action="?/createMeeting" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Meeting Details -->
          <div class="space-y-4">
            <div>
              <label for="type" class="block text-sm font-medium mb-1">Meeting Type</label>
              <select name="type" id="type" required class="w-full p-2 border rounded">
                <option value="">Select type...</option>
                <option value="in_person">In Person</option>
                <option value="phone_call">Phone Call</option>
                <option value="video_call">Video Call</option>
              </select>
            </div>

            <div>
              <label for="location" class="block text-sm font-medium mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                name="location"
                id="location"
                class="w-full p-2 border rounded"
                placeholder="Meeting location or platform"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                id="description"
                required
                class="w-full p-2 border rounded h-24"
                placeholder="Meeting agenda and topics"
              ></textarea>
            </div>
          </div>

          <!-- Participants -->
          <div class="space-y-4">
            <!-- Government Officials -->
            <div>
              <label class="block text-sm font-medium mb-2">Government Officials (Required)</label>
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

            <!-- Lobbyists -->
            <div>
              <label class="block text-sm font-medium mb-2">Lobbyists (Required)</label>
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

            <!-- Client Representations (only for consultant lobbyists) -->
            {#if consultantLobbyists.length > 0}
              <div>
                <label class="block text-sm font-medium mb-2">
                  Client Representations (Optional)
                </label>
                <p class="text-xs text-gray-600 mb-2">
                  For each consultant lobbyist: specify which clients they represent in this meeting
                </p>
                <div class="max-h-40 overflow-y-auto border rounded p-2 bg-white space-y-3">
                  {#each consultantLobbyists as { lobbyist, organization }}
                    {@const availableRepresentations = data.representatives.filter(
                      (rep) => rep.representative_id === organization?.id,
                    )}
                    {#if availableRepresentations.length > 0}
                      <div class="border-l-2 border-blue-200 pl-3">
                        <div class="text-sm font-medium text-gray-700 mb-1">
                          {lobbyist.name} ({organization?.name}) can represent:
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
          Schedule Meeting
        </button>
      </form>
    </div>
  {/if}

  <!-- Meetings List -->
  <div>
    <h2 class="text-2xl font-semibold mb-4">Scheduled Meetings</h2>
    <div class="space-y-6">
      {#each data.meetings as meeting}
        <div class="border rounded-lg p-6 bg-white">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold">{meeting.description}</h3>
              <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
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
            <!-- Government Officials -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Government Officials</h4>
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

            <!-- Lobbyists -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Lobbyists</h4>
              <div class="space-y-2">
                {#each data.meetingLobbyists.filter((ml) => ml.meeting_id === meeting.id) as meetingLobbyist}
                  {#if meetingLobbyist.lobbyist && meetingLobbyist.organization}
                    <div class="text-sm bg-purple-50 p-2 rounded">
                      <div class="font-medium">{meetingLobbyist.lobbyist.name}</div>
                      <div class="text-gray-600">{meetingLobbyist.lobbyist.function}</div>
                      <div class="text-gray-600">
                        {meetingLobbyist.organization.name} ({meetingLobbyist.organization.type})
                      </div>

                      <!-- Show client representations for consultant lobbyists -->
                      {#if meetingLobbyist.organization.type === 'consultant'}
                        {@const representations = data.meetingRepresentations.filter(
                          (mr) => mr.meeting_lobbyist_id === meetingLobbyist.id,
                        )}
                        {#if representations.length > 0}
                          <div class="mt-2 ml-2">
                            <div class="text-xs font-medium text-gray-700">Representing:</div>
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
          No meetings scheduled yet. Create your first meeting above.
        </div>
      {/if}
    </div>
  </div>
</div>
