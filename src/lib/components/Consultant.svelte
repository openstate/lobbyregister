<script lang="ts">
  import MultiSelect from "svelte-multiselect";
  import type { ObjectOption } from "svelte-multiselect";

  let { representativeName, allSelectedClients = $bindable(), consultantId, allClientsOptions }:
   {representativeName: string, allSelectedClients: { [key: string]: ObjectOption[]},
   consultantId: string, allClientsOptions: ObjectOption[] } = $props();
</script>

<div class="text-lg @lg:col-span-2 mt-2">{representativeName}</div>
<div class="@lg:col-span-2">
  <MultiSelect bind:selected={
    () => allSelectedClients[consultantId],
    (v) => {allSelectedClients[consultantId] = v;}
  } options={allClientsOptions} 
  placeholder="Selecteer 1 of meerdere klanten" required />
</div>
