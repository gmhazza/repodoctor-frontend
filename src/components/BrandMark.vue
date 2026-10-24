<script setup>
defineProps({
  small: Boolean,
})
</script>

<template>
  <div :class="['brand-mark', { 'brand-mark-small': small }]">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      <path
        d="M6.5 17.5 9 15l2 2 4.5-5 2 2"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
