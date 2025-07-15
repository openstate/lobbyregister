<script lang="ts">
  interface Props {
    /** The type of element to render - button or link */
    variant?: 'button' | 'link';
    /** For button variant - button type (submit, button, etc.) */
    type?: 'button' | 'submit' | 'reset';
    /** For link variant - href url */
    href?: string;
    /** Button size - affects padding and text size */
    size?: 'sm' | 'md' | 'lg';
    /** Click handler for button variant */
    onclick?: (event: MouseEvent) => void;
    /** Additional CSS classes */
    class?: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    children: any;
  }

  let {
    variant = 'button',
    type = 'button',
    href,
    size = 'md',
    onclick,
    class: additionalClass = '',
    disabled = false,
    children,
  }: Props = $props();

  const baseClasses = 'bg-gov-blue text-white hover:bg-gov-dark-blue font-semibold transition-colors';

  // Size-specific classes
  const sizeClasses = {
    sm: 'py-1 px-3',
    md: 'text-lg py-2 px-4.5',
    lg: 'text-xl py-3 px-6',
  };

  const allClasses = `${baseClasses} ${sizeClasses[size]} ${additionalClass}`.trim();
</script>

{#if variant === 'link'}
  <a {href} class={allClasses}>
    {@render children()}
  </a>
{:else}
  <button {type} {onclick} {disabled} class="{allClasses} cursor-pointer">
    {@render children()}
  </button>
{/if}
