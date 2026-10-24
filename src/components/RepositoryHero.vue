<script setup>
defineProps({
  repository: {
    type: String,
    required: true,
  },
  isAnalyzing: Boolean,
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:repository', 'analyze'])
</script>

<template>
  <section
    class="hero-card relative overflow-hidden rounded-[28px] border border-white/9 px-6 py-7 sm:px-9 sm:py-9 lg:px-12 lg:py-11"
  >
    <div class="relative z-10 max-w-3xl">
      <div class="eyebrow flex items-center gap-2 text-emerald-400">
        <span
          class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
        ></span>
        Repository intelligence
      </div>
      <h1
        class="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.2rem] lg:leading-[1.08]"
      >
        Find the issues before your users do.
      </h1>
      <p class="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
        Point Repo Doctor at a public GitHub repository. We’ll scan the codebase and surface the
        fixes that matter most.
      </p>

      <form
        class="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
        @submit.prevent="emit('analyze')"
      >
        <label class="input-wrap flex-1">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 19c-4.4 1.4-4.4-2.4-6-3m12.2 6v-3.4a3.2 3.2 0 0 0-.9-2.5c3 0 6.1-1.5 6.1-6.8a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7s-1.2-.4-3.8 1.4a13.2 13.2 0 0 0-6.9 0C5.6 1.5 4.4 2 4.4 2a4.9 4.9 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.1 6.8 6.1 6.8a3.2 3.2 0 0 0-.9 2.5V22"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            :value="repository"
            type="url"
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            @input="emit('update:repository', $event.target.value)"
          />
        </label>
        <button class="button-primary min-h-12 sm:min-w-36" type="submit" :disabled="isAnalyzing">
          <span v-if="isAnalyzing" class="spinner"></span>
          <span>{{ isAnalyzing ? 'Scanning…' : 'Analyze repo' }}</span>
          <svg v-if="!isAnalyzing" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </form>
      <p
        v-if="errorMessage"
        class="mt-4 flex items-center gap-2 text-xs text-rose-300"
        role="alert"
      >
        <span
          class="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400/15 text-[10px] font-bold"
          >!</span
        >
        {{ errorMessage }}
      </p>
    </div>
    <div class="hero-orb hero-orb-one"></div>
    <div class="hero-orb hero-orb-two"></div>
    <div class="hero-grid"></div>
    <div class="hero-pulse" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span
      ><span></span><span></span><span></span>
    </div>
  </section>
</template>
