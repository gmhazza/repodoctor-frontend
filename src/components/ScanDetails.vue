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
})
</script>

<template>
  <section id="skipped" class="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
    <div class="panel px-5 py-5 sm:px-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">Scan coverage</p>
          <h2 class="mt-2 text-base font-semibold text-white">Skipped files</h2>
        </div>
        <span class="text-2xl font-semibold tracking-[-0.05em] text-zinc-300">{{
          analysis?.skippedFiles?.length || 0
        }}</span>
      </div>
      <div class="mt-5 space-y-3">
        <div
          v-for="item in (analysis?.skippedFiles || []).slice(0, 3)"
          :key="item.file"
          class="flex items-center justify-between gap-4 text-xs"
        >
          <span class="truncate font-mono text-zinc-400">{{ item.file }}</span>
          <span class="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-500">{{
            item.reason.replaceAll('_', ' ').toLowerCase()
          }}</span>
        </div>
      </div>
    </div>

    <div class="panel px-5 py-5 sm:px-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">Run metadata</p>
          <h2 class="mt-2 text-base font-semibold text-white">Analysis context</h2>
        </div>
        <span
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300"
          >⌁</span
        >
      </div>
      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
        <div>
          <dt class="text-zinc-600">Repository</dt>
          <dd class="mt-1 truncate font-mono text-zinc-300">{{ repositoryName }}</dd>
        </div>
        <div>
          <dt class="text-zinc-600">Failed files</dt>
          <dd class="mt-1 text-zinc-300">{{ analysis?.failedFiles?.length || 0 }}</dd>
        </div>
        <div>
          <dt class="text-zinc-600">Scan type</dt>
          <dd class="mt-1 text-zinc-300">
            {{ scanSource === 'live' ? 'Live API' : 'Not started' }}
          </dd>
        </div>
        <div>
          <dt class="text-zinc-600">Coverage</dt>
          <dd class="mt-1 text-zinc-300">
            {{ analysis?.summary?.analyzedFiles || 0 }} of
            {{ analysis?.summary?.totalFiles || 0 }} files
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
