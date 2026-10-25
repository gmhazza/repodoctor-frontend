<script setup>
import BrandMark from '@/components/BrandMark.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <main class="not-found-page">
    <header class="welcome-header">
      <RouterLink class="flex items-center gap-3" to="/">
        <BrandMark />
        <div>
          <p class="text-sm font-semibold tracking-tight text-white">Repo Doctor</p>
          <p class="mt-0.5 text-[11px] text-zinc-500">Code health, simplified</p>
        </div>
      </RouterLink>
      <ThemeToggle />
    </header>

    <section class="not-found-content">
      <div class="not-found-code" aria-hidden="true">404</div>
      <div class="relative z-10">
        <p class="eyebrow flex items-center justify-center gap-2 text-emerald-400">
          <span
            class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
          ></span>
          Page not found
        </p>
        <h1 class="not-found-title">This route needs a checkup.</h1>
        <p class="not-found-description">
          The page you’re looking for doesn’t exist or may have moved. Let’s get you back to a
          healthy starting point.
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <RouterLink class="button-primary" to="/">Back to welcome</RouterLink>
          <RouterLink class="button-secondary" to="/analyze">Open analyzer</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
