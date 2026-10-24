<script setup>
import BrandMark from '@/components/BrandMark.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineEmits(['feedback'])
</script>

<template>
  <header class="topbar">
    <RouterLink class="flex items-center gap-3 lg:hidden" to="/">
      <BrandMark small />
      <span class="text-sm font-semibold text-white">Repo Doctor</span>
    </RouterLink>
    <div class="hidden items-center gap-2 text-xs text-zinc-500 lg:flex">
      <span>Workspace</span><span class="text-zinc-700">/</span
      ><span class="text-zinc-300">Overview</span>
    </div>
    <div class="ml-auto flex items-center gap-3">
      <ThemeToggle />
      <button
        class="icon-button"
        type="button"
        aria-label="Send feedback"
        title="Send feedback"
        @click="$emit('feedback')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.5-.7L3 21l1.7-4.2A8.2 8.2 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="avatar">JD</div>
    </div>
  </header>
</template>
