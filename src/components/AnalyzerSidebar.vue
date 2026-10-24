<script setup>
import BrandMark from '@/components/BrandMark.vue'

defineProps({
  problemCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['feedback'])
</script>

<template>
  <aside class="sidebar hidden border-r border-white/8 bg-[#0d0e12]/90 lg:flex">
    <div class="flex h-full w-full flex-col px-5 py-6">
      <RouterLink class="flex items-center gap-3 px-2" to="/">
        <BrandMark />
        <div>
          <p class="text-sm font-semibold tracking-tight text-white">Repo Doctor</p>
          <p class="mt-0.5 text-[11px] text-zinc-500">Code health, simplified</p>
        </div>
      </RouterLink>

      <div class="mt-12">
        <p class="eyebrow px-3">Workspace</p>
        <nav class="mt-3 space-y-1">
          <RouterLink class="nav-item nav-item-active" to="/analyze#overview">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-12h6V4h-6v4Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
            </svg>
            Overview
          </RouterLink>
          <a class="nav-item" href="#issues">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m12 4 8 4.5v7L12 20l-8-4.5v-7L12 4Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="m8 9 4 2.2L16 9M12 11.2V16"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Findings
            <span class="ml-auto rounded-full bg-white/7 px-2 py-0.5 text-[10px] text-zinc-400">{{
              problemCount
            }}</span>
          </a>
          <a class="nav-item" href="#skipped">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="m8 9.5 8 5M16 9.5l-8 5"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
            </svg>
            Skipped files
          </a>
        </nav>
      </div>

      <div class="mt-auto">
        <div class="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-zinc-300">Need a second opinion?</p>
              <p class="mt-1 text-[11px] leading-5 text-zinc-500">
                Tell us what would make your review workflow better.
              </p>
            </div>
            <span class="mt-0.5 text-emerald-400">↗</span>
          </div>
          <button class="button-secondary mt-4 w-full" type="button" @click="$emit('feedback')">
            Send feedback
          </button>
        </div>
        <p class="mt-5 px-2 text-[11px] text-zinc-600">v0.1 · Private by default</p>
      </div>
    </div>
  </aside>
</template>
