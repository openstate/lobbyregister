<script lang="ts">
  import { getFlash } from 'sveltekit-flash-message';
  import { page } from '$app/state';

  const flash = getFlash(page);
</script>

{#if $flash}
  {#if ($flash.type == 'success')}
    <div class="mb-8 bg-green-100 text-green-800 px-6 sm:px-8 py-4 sm:py-5">
      {@html $flash.message}
    </div>
  {:else if $flash.type == 'error'}
    <div class="mb-8 bg-red-100 text-red-800 px-6 sm:px-8 py-4 sm:py-5">
      {@html $flash.message}
    </div>
  {/if}
{/if}
