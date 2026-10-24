<script setup>
import { computed } from 'vue'

const props = defineProps({
  problems: {
    type: Array,
    default: () => [],
  },
  selectedProblem: {
    type: Object,
    default: null,
  },
  activeFilter: {
    type: String,
    required: true,
  },
  filters: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select', 'filter'])

const filteredProblems = computed(() => {
  if (props.activeFilter === 'all') return props.problems
  return props.problems.filter((problem) => problem.severity === props.activeFilter)
})

function severityClass(severity) {
  return `severity-${severity}`
}

function severityIcon(severity) {
  return { critical: '!', high: '↑', medium: '•', low: '↓' }[severity] || '•'
}
</script>

<template>
  <section id="issues" class="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
    <div class="panel overflow-hidden">
      <div class="border-b border-white/8 px-5 py-5 sm:px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-base font-semibold text-white">Findings</h2>
            <p class="mt-1 text-xs text-zinc-500">Prioritized issues surfaced by the scan.</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="filter in filters"
              :key="filter.id"
              class="filter-button"
              :class="{ 'filter-button-active': activeFilter === filter.id }"
              type="button"
              @click="emit('filter', filter.id)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredProblems.length" class="divide-y divide-white/6">
        <button
          v-for="problem in filteredProblems"
          :key="`${problem.file}-${problem.line}`"
          class="issue-row w-full text-left"
          :class="{ 'issue-row-active': selectedProblem === problem }"
          type="button"
          @click="emit('select', problem)"
        >
          <div class="flex items-start gap-3">
            <span class="severity-badge" :class="severityClass(problem.severity)">{{
              severityIcon(problem.severity)
            }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p class="truncate text-sm font-medium text-zinc-200">{{ problem.title }}</p>
                <span class="category-pill">{{ problem.category }}</span>
              </div>
              <p class="mt-1.5 truncate font-mono text-[11px] text-zinc-500">
                {{ problem.file }} <span class="text-zinc-700">:</span> {{ problem.line }}
              </p>
            </div>
            <span class="mt-1 text-zinc-600">›</span>
          </div>
        </button>
      </div>
      <div v-else class="px-6 py-16 text-center">
        <div
          class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"
        >
          ✓
        </div>
        <p class="mt-4 text-sm font-medium text-zinc-200">
          {{ problems.length ? `No ${activeFilter} issues found` : 'No scan results yet' }}
        </p>
        <p class="mt-1 text-xs text-zinc-500">
          {{
            problems.length
              ? 'This severity level is clear in the current scan.'
              : 'Analyze a repository to see findings here.'
          }}
        </p>
      </div>
    </div>

    <aside class="panel min-h-[360px]">
      <div class="border-b border-white/8 px-5 py-5 sm:px-6">
        <p class="eyebrow">Inspector</p>
        <h2 class="mt-2 text-base font-semibold text-white">Issue details</h2>
      </div>
      <div v-if="selectedProblem" class="px-5 py-6 sm:px-6">
        <div class="flex items-center justify-between gap-3">
          <span class="severity-text" :class="severityClass(selectedProblem.severity)"
            >{{ selectedProblem.severity }} priority</span
          >
          <span class="category-pill">{{ selectedProblem.category }}</span>
        </div>
        <h3 class="mt-4 text-lg font-semibold leading-7 text-white">{{ selectedProblem.title }}</h3>
        <div class="mt-3 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ selectedProblem.file }}
          <span class="text-zinc-700">line {{ selectedProblem.line }}</span>
        </div>
        <div class="mt-7">
          <p class="eyebrow">What we found</p>
          <p class="mt-2 text-sm leading-6 text-zinc-400">{{ selectedProblem.description }}</p>
        </div>
        <div class="mt-6 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.045] p-4">
          <div class="flex gap-3">
            <span class="mt-0.5 text-emerald-300">✦</span>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-200/80">
                Suggested fix
              </p>
              <p class="mt-2 text-sm leading-6 text-zinc-300">{{ selectedProblem.suggestedFix }}</p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="flex h-64 items-center justify-center px-6 text-center text-sm text-zinc-500"
      >
        Select a finding to inspect it.
      </div>
    </aside>
  </section>
</template>
