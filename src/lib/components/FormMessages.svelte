<script lang="ts">
  let { message, issues }: { message?: string, issues?: string[] } = $props();
</script>

{#if message}
  <div class="mb-6 p-4 bg-red-100 text-red-700 border border-red-200">
    {message}
    <ul>
      {#each (issues || []) as issue }
        <li class="pl-4">- {issue}</li>
      {/each}
    </ul>
  </div>
  <script lang="ts">
  window.scrollTo({ top: 100, behavior: 'smooth' });
  </script>
{/if}
