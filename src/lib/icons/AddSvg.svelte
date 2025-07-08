<script lang="ts">
  interface Props {
    class?: string;
  }

  let {
    class: additionalClass = '',
  }: Props = $props();

  const allClasses = `${additionalClass}`
</script>

<svg class={allClasses} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke-width="2" stroke-linecap="round" stroke-linejoin="    round"/>
</svg>
