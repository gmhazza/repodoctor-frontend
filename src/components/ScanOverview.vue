<script setup>
defineProps({
  analysis: {
    type: Object,
    required: true,
  },
  repositoryName: {
    type: String,
    required: true,
  },
  scanSource: {
    type: String,
    required: true,
  },
  isAnalyzing: Boolean,
})

defineEmits(['analyze'])
</script>

<template>
  <div>
    <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-semibold tracking-tight text-white sm:text-2xl">Scan overview</h2>
          <span
            v-if="scanSource === 'live'"
            class="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-200/80"
            >Live scan</span
          >
          <span
            v-else
            class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400"
            >Ready to scan</span
          >
        </div>
        <p v-if="scanSource === 'live'" class="mt-2 text-sm text-zinc-500">
          Latest scan for <span class="text-zinc-300">{{ repositoryName }}</span>
        </p>
        <p v-else class="mt-2 text-sm text-zinc-500">
          Paste a repository URL above to begin your first scan.
        </p>
      </div>
      <button
        class="button-secondary self-start sm:self-auto"
        type="button"
        :disabled="isAnalyzing"
        @click="$emit('analyze')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10m0 0V5m0 5h5M4 13a8.1 8.1 0 0 0 14.8 4L21 14m0 0v5m0-5h-5"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ scanSource === 'live' ? 'Run again' : 'Analyze repository' }}
      </button>
    </div>

    <section class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      <div class="stat-card">
        <span class="stat-label">Files scanned</span>
        <div class="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">
          {{ analysis?.summary?.analyzedFiles || 0
          }}<span class="ml-1 text-sm font-normal text-zinc-600"
            >/ {{ analysis?.summary?.totalFiles || 0 }}</span
          >
        </div>
        <p class="mt-2 text-xs text-zinc-500">{{ analysis?.summary?.skippedFiles || 0 }} skipped</p>
      </div>
      <div class="stat-card">
        <span class="stat-label">Issues found</span>
        <div class="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">
          {{ analysis?.summary?.problems || 0 }}
        </div>
        <p class="mt-2 text-xs text-zinc-500">Across the codebase</p>
      </div>
      <div class="stat-card">
        <span class="stat-label">High priority</span>
        <div class="mt-5 text-3xl font-semibold tracking-[-0.05em] text-rose-300">
          {{ (analysis?.summary?.critical || 0) + (analysis?.summary?.high || 0) }}
        </div>
        <p class="mt-2 text-xs text-zinc-500">Needs attention first</p>
      </div>
    </section>
  </div>
</template>
