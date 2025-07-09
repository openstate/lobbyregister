<script lang="ts">
  import { page } from '$app/state';
  import { getFlash } from 'sveltekit-flash-message';

  const flash = getFlash(page);

  let type = $state('');
  let message = $state('');

  flash.subscribe((value) => {
    type = value ? value.type : '';
    message = value ? value.message : '';
  });
</script>

{#if (type == 'success')}
  <div class="mb-8 bg-green-100 text-green-800 px-6 sm:px-8 py-4 sm:py-5">
    {@html message}
  </div>
{:else if type == 'error'}
  <div class="mb-8 bg-red-100 text-red-800 px-6 sm:px-8 py-4 sm:py-5">
    {@html message}
  </div>
{/if}