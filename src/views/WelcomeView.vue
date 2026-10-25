<script setup>
import { useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

function startAnalyzing() {
  router.push({ name: 'analyze' })
}
</script>

<template>
  <main class="welcome-page">
    <header class="welcome-header">
      <RouterLink class="flex items-center gap-3" to="/">
        <BrandMark />
        <div>
          <p class="text-sm font-semibold tracking-tight text-white">Repo Doctor</p>
          <p class="mt-0.5 text-[11px] text-zinc-500">Code health, simplified</p>
        </div>
      </RouterLink>
      <div class="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>

    <section class="welcome-content">
      <div class="welcome-copy">
        <p class="eyebrow flex items-center gap-2 text-emerald-400">
          <span
            class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
          ></span
          >Repository intelligence
        </p>
        <h1 class="welcome-title">A clearer path from code to confidence.</h1>
        <p class="welcome-description">
          Repo Doctor reviews your public GitHub repository, finds the issues worth fixing, and
          gives you a focused path forward.
        </p>
        <button class="button-primary welcome-cta" type="button" @click="startAnalyzing">
          Start analyzing
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <p class="welcome-note">No setup required · Start with any public GitHub URL</p>
      </div>

      <div class="welcome-visual" aria-hidden="true">
        <div class="welcome-orbit welcome-orbit-one"></div>
        <div class="welcome-orbit welcome-orbit-two"></div>
        <div class="welcome-scan-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="welcome-card-dot"></span
              ><span class="text-[11px] font-medium text-zinc-300">Repository insights</span>
            </div>
            <span class="text-[10px] text-zinc-600">READY</span>
          </div>
          <div class="mt-7 flex items-end gap-3">
            <span class="welcome-score">Ready</span
            ><span class="mb-1 text-xs text-zinc-500">for your repository</span>
          </div>
          <div class="welcome-bars mt-6">
            <span></span><span></span><span></span><span></span><span></span><span></span
            ><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="welcome-ready-note mt-6">Paste a public GitHub URL to begin.</p>
        </div>
      </div>
    </section>

    <section class="welcome-features">
      <div class="welcome-feature">
        <span class="welcome-feature-icon">⌁</span>
        <div>
          <h2>See what matters</h2>
          <p>Issues are grouped by severity so you can start with the highest signal.</p>
        </div>
      </div>
      <div class="welcome-feature">
        <span class="welcome-feature-icon">✦</span>
        <div>
          <h2>Understand the why</h2>
          <p>Every finding includes context and a practical suggested fix.</p>
        </div>
      </div>
      <div class="welcome-feature">
        <span class="welcome-feature-icon">↗</span>
        <div>
          <h2>Keep your flow</h2>
          <p>Scan a repository in seconds without adding another local toolchain.</p>
        </div>
      </div>
    </section>
  </main>
</template>
