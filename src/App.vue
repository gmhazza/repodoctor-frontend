<script setup>
import { computed, onMounted, ref } from 'vue'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const sampleAnalysis = {
  repository: { owner: 'expressjs', name: 'express' },
  summary: {
    totalFiles: 183,
    analyzedFiles: 142,
    skippedFiles: 41,
    problems: 4,
    critical: 0,
    high: 1,
    medium: 2,
    low: 1,
  },
  problems: [
    {
      file: 'lib/router/index.js',
      line: 142,
      severity: 'high',
      category: 'security',
      title: 'Unvalidated redirect target',
      description:
        'User supplied input from request query is forwarded directly without sanitization.',
      suggestedFix: 'Validate target URL against an allowlist of permitted domain hosts.',
    },
    {
      file: 'lib/response.js',
      line: 88,
      severity: 'medium',
      category: 'error-handling',
      title: 'Unhandled error callback',
      description: 'Callback error parameter is not checked before invoking handler.',
      suggestedFix: 'Add if (err) return next(err); at the start of the callback.',
    },
    {
      file: 'test/support/fixtures.js',
      line: 34,
      severity: 'medium',
      category: 'maintainability',
      title: 'Fixture duplicates production logic',
      description: 'Test fixture repeats a transformation already owned by the application layer.',
      suggestedFix: 'Share the transformation through a small, focused test helper.',
    },
    {
      file: 'examples/error-pages/index.js',
      line: 21,
      severity: 'low',
      category: 'documentation',
      title: 'Example misses edge case',
      description: 'The example does not show how to handle a missing error status code.',
      suggestedFix: 'Add a fallback status and a short comment for the edge case.',
    },
  ],
  skippedFiles: [
    { file: 'dist/bundle.js', reason: 'IGNORED_DIRECTORY' },
    { file: 'package-lock.json', reason: 'IGNORED_LOCKFILE' },
    { file: 'assets/logo.png', reason: 'IGNORED_MEDIA_OR_BINARY' },
    { file: '.env', reason: 'SENSITIVE_FILE' },
  ],
  failedFiles: [],
}

const repository = ref('https://github.com/expressjs/express')
const analysis = ref(structuredClone(sampleAnalysis))
const selectedProblem = ref(analysis.value.problems[0])
const activeFilter = ref('all')
const isAnalyzing = ref(false)
const errorMessage = ref('')
const scanSource = ref('sample')
const showContact = ref(false)
const contactState = ref('idle')
const contactError = ref('')
const contactForm = ref({ name: '', subject: '', body: '' })
const isWelcome = ref(true)
const themeMode = ref(
  typeof window !== 'undefined' && window.localStorage.getItem('repo-doctor-theme') === 'light'
    ? 'light'
    : 'dark',
)

const filters = [
  { id: 'all', label: 'All issues' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

const filteredProblems = computed(() => {
  if (activeFilter.value === 'all') return analysis.value?.problems || []
  return (analysis.value?.problems || []).filter(
    (problem) => problem.severity === activeFilter.value,
  )
})

const repositoryName = computed(() => {
  if (!analysis.value?.repository) return 'Repository'
  return `${analysis.value.repository.owner}/${analysis.value.repository.name}`
})

function applyTheme(mode) {
  themeMode.value = mode
  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode
  window.localStorage.setItem('repo-doctor-theme', mode)
}

function toggleTheme() {
  applyTheme(themeMode.value === 'dark' ? 'light' : 'dark')
}

function enterApp() {
  isWelcome.value = false
}

function severityClass(severity) {
  return (
    {
      critical: 'severity-critical',
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low',
    }[severity] || 'severity-low'
  )
}

function severityIcon(severity) {
  return (
    {
      critical: '!',
      high: '↑',
      medium: '•',
      low: '↓',
    }[severity] || '•'
  )
}

function selectProblem(problem) {
  selectedProblem.value = problem
}

function useSample() {
  analysis.value = structuredClone(sampleAnalysis)
  selectedProblem.value = analysis.value.problems[0]
  scanSource.value = 'sample'
  activeFilter.value = 'all'
  errorMessage.value = ''
  repository.value = 'https://github.com/expressjs/express'
}

async function analyzeRepository() {
  errorMessage.value = ''
  const value = repository.value.trim()

  if (!value) {
    errorMessage.value = 'Paste a public GitHub repository URL to start a scan.'
    return
  }

  if (!/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(value)) {
    errorMessage.value = 'Use a public GitHub URL like https://github.com/owner/repository.'
    return
  }

  isAnalyzing.value = true

  try {
    const response = await fetch(`${apiBaseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository: value }),
    })

    if (!response.ok) throw new Error(`The analysis request failed with status ${response.status}.`)

    const payload = await response.json()
    if (!payload.summary || !Array.isArray(payload.problems)) {
      throw new Error('The API returned an unexpected analysis format.')
    }

    analysis.value = payload
    selectedProblem.value = payload.problems[0] || null
    activeFilter.value = 'all'
    scanSource.value = 'live'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to analyze this repository right now.'
  } finally {
    isAnalyzing.value = false
  }
}

function openContact() {
  contactState.value = 'idle'
  contactError.value = ''
  showContact.value = true
}

function closeContact() {
  if (contactState.value !== 'sending') showContact.value = false
}

async function sendMessage() {
  contactError.value = ''
  if (!contactForm.value.name || !contactForm.value.subject || !contactForm.value.body) {
    contactError.value = 'Complete all fields before sending your message.'
    return
  }

  contactState.value = 'sending'

  try {
    const response = await fetch(`${apiBaseUrl}/mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm.value),
    })

    if (!response.ok) throw new Error('The message could not be sent.')
    contactState.value = 'sent'
    contactForm.value = { name: '', subject: '', body: '' }
  } catch (error) {
    contactState.value = 'error'
    contactError.value = error.message || 'The message could not be sent.'
  }
}

onMounted(() => applyTheme(themeMode.value))
</script>

<template>
  <div :class="['app-shell min-h-screen text-zinc-100', `theme-${themeMode}`]">
    <template v-if="isWelcome">
      <main class="welcome-page">
        <header class="welcome-header">
          <div class="flex items-center gap-3">
            <div class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <path
                  d="M6.5 17.5 9 15l2 2 4.5-5 2 2"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold tracking-tight text-white">Repo Doctor</p>
              <p class="mt-0.5 text-[11px] text-zinc-500">Code health, simplified</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="welcome-private-badge hidden sm:inline-flex">Private by default</span>
            <button
              class="theme-toggle"
              type="button"
              :aria-label="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
              :title="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="toggleTheme"
            >
              <svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
                <path
                  d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="hidden sm:inline">{{
                themeMode === 'dark' ? 'Light mode' : 'Dark mode'
              }}</span>
            </button>
          </div>
        </header>

        <section class="welcome-content">
          <div class="welcome-copy">
            <p class="eyebrow flex items-center gap-2 text-emerald-400">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
              ></span>
              Repository intelligence
            </p>
            <h1 class="welcome-title">A clearer path from code to confidence.</h1>
            <p class="welcome-description">
              Repo Doctor reviews your public GitHub repository, finds the issues worth fixing, and
              gives you a focused path forward.
            </p>
            <button class="button-primary welcome-cta" type="button" @click="enterApp">
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
                  <span class="welcome-card-dot"></span>
                  <span class="text-[11px] font-medium text-zinc-300">express / express</span>
                </div>
                <span class="text-[10px] text-zinc-600">SCAN READY</span>
              </div>
              <div class="mt-7 flex items-end gap-3">
                <span class="welcome-score">142</span>
                <span class="mb-1 text-xs text-zinc-500">files ready to review</span>
              </div>
              <div class="welcome-bars mt-6">
                <span></span><span></span><span></span><span></span><span></span><span></span
                ><span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="mt-6 grid grid-cols-3 gap-2">
                <div class="welcome-mini-stat">
                  <span class="text-amber-300">01</span><small>high</small>
                </div>
                <div class="welcome-mini-stat">
                  <span class="text-yellow-300">02</span><small>medium</small>
                </div>
                <div class="welcome-mini-stat">
                  <span class="text-cyan-300">01</span><small>low</small>
                </div>
              </div>
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
    <template v-else>
      <aside class="sidebar hidden border-r border-white/8 bg-[#0d0e12]/90 lg:flex">
        <div class="flex h-full w-full flex-col px-5 py-6">
          <div class="flex items-center gap-3 px-2">
            <div class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <path
                  d="M6.5 17.5 9 15l2 2 4.5-5 2 2"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold tracking-tight text-white">Repo Doctor</p>
              <p class="mt-0.5 text-[11px] text-zinc-500">Code health, simplified</p>
            </div>
          </div>

          <div class="mt-12">
            <p class="eyebrow px-3">Workspace</p>
            <nav class="mt-3 space-y-1">
              <a class="nav-item nav-item-active" href="#overview">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-12h6V4h-6v4Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                  />
                </svg>
                Overview
              </a>
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
                <span
                  class="ml-auto rounded-full bg-white/7 px-2 py-0.5 text-[10px] text-zinc-400"
                  >{{ analysis?.summary?.problems || 0 }}</span
                >
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
              <button class="button-secondary mt-4 w-full" type="button" @click="openContact">
                Send feedback
              </button>
            </div>
            <p class="mt-5 px-2 text-[11px] text-zinc-600">v0.1 · Private by default</p>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <header class="topbar">
          <div class="flex items-center gap-3 lg:hidden">
            <div class="brand-mark brand-mark-small">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <path
                  d="M6.5 17.5 9 15l2 2 4.5-5 2 2"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="text-sm font-semibold text-white">Repo Doctor</span>
          </div>
          <div class="hidden items-center gap-2 text-xs text-zinc-500 lg:flex">
            <span>Workspace</span><span class="text-zinc-700">/</span
            ><span class="text-zinc-300">Overview</span>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <button
              class="theme-toggle"
              type="button"
              :aria-label="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
              :title="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="toggleTheme"
            >
              <svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
                <path
                  d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="hidden sm:inline">{{
                themeMode === 'dark' ? 'Light mode' : 'Dark mode'
              }}</span>
            </button>
            <button
              class="icon-button"
              type="button"
              aria-label="Send feedback"
              title="Send feedback"
              @click="openContact"
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

        <div id="overview" class="mx-auto max-w-[1450px] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
          <section
            class="hero-card relative overflow-hidden rounded-[28px] border border-white/9 px-6 py-7 sm:px-9 sm:py-9 lg:px-12 lg:py-11"
          >
            <div class="relative z-10 max-w-3xl">
              <div class="eyebrow flex items-center gap-2 text-emerald-400">
                <span
                  class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                ></span
                >Repository intelligence
              </div>
              <h1
                class="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.2rem] lg:leading-[1.08]"
              >
                Find the issues before your users do.
              </h1>
              <p class="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Point Repo Doctor at a public GitHub repository. We’ll scan the codebase and surface
                the fixes that matter most.
              </p>

              <form
                class="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
                @submit.prevent="analyzeRepository"
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
                    v-model="repository"
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    aria-label="GitHub repository URL"
                  />
                </label>
                <button
                  class="button-primary min-h-12 sm:min-w-36"
                  type="submit"
                  :disabled="isAnalyzing"
                >
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
              <div
                class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500"
              >
                <span>Try it with a public repository</span>
                <button
                  class="text-zinc-300 underline decoration-white/20 underline-offset-4 transition hover:text-white"
                  type="button"
                  @click="useSample"
                >
                  Load sample scan
                </button>
              </div>
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
              <span></span><span></span><span></span><span></span><span></span><span></span
              ><span></span><span></span><span></span><span></span>
            </div>
          </section>

          <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Scan overview
                </h2>
                <span
                  v-if="scanSource === 'sample'"
                  class="rounded-full border border-amber-300/15 bg-amber-300/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-200/80"
                  >Preview data</span
                >
                <span
                  v-else
                  class="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-200/80"
                  >Live scan</span
                >
              </div>
              <p class="mt-2 text-sm text-zinc-500">
                Latest scan for <span class="text-zinc-300">{{ repositoryName }}</span>
              </p>
            </div>
            <button
              class="button-secondary self-start sm:self-auto"
              type="button"
              @click="analyzeRepository"
              :disabled="isAnalyzing"
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
              Run again
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
              <p class="mt-2 text-xs text-zinc-500">
                {{ analysis?.summary?.skippedFiles || 0 }} skipped
              </p>
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

          <section
            id="issues"
            class="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]"
          >
            <div class="panel overflow-hidden">
              <div class="border-b border-white/8 px-5 py-5 sm:px-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-base font-semibold text-white">Findings</h2>
                    <p class="mt-1 text-xs text-zinc-500">
                      Prioritized issues surfaced by the scan.
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="filter in filters"
                      :key="filter.id"
                      class="filter-button"
                      :class="{ 'filter-button-active': activeFilter === filter.id }"
                      type="button"
                      @click="activeFilter = filter.id"
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
                  @click="selectProblem(problem)"
                >
                  <div class="flex items-start gap-3">
                    <span class="severity-badge" :class="severityClass(problem.severity)">{{
                      severityIcon(problem.severity)
                    }}</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p class="truncate text-sm font-medium text-zinc-200">
                          {{ problem.title }}
                        </p>
                        <span class="category-pill">{{ problem.category }}</span>
                      </div>
                      <p class="mt-1.5 truncate font-mono text-[11px] text-zinc-500">
                        {{ problem.file }} <span class="text-zinc-700">:</span> {{ problem.line }}
                      </p>
                    </div>
                    <span class="mt-1 text-zinc-600 transition group-hover:text-zinc-300">›</span>
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
                  No {{ activeFilter }} issues found
                </p>
                <p class="mt-1 text-xs text-zinc-500">
                  This severity level is clear in the current scan.
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
                  ><span class="category-pill">{{ selectedProblem.category }}</span>
                </div>
                <h3 class="mt-4 text-lg font-semibold leading-7 text-white">
                  {{ selectedProblem.title }}
                </h3>
                <div class="mt-3 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                  >{{ selectedProblem.file
                  }}<span class="text-zinc-700">line {{ selectedProblem.line }}</span>
                </div>
                <div class="mt-7">
                  <p class="eyebrow">What we found</p>
                  <p class="mt-2 text-sm leading-6 text-zinc-400">
                    {{ selectedProblem.description }}
                  </p>
                </div>
                <div
                  class="mt-6 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.045] p-4"
                >
                  <div class="flex gap-3">
                    <span class="mt-0.5 text-emerald-300">✦</span>
                    <div>
                      <p
                        class="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-200/80"
                      >
                        Suggested fix
                      </p>
                      <p class="mt-2 text-sm leading-6 text-zinc-300">
                        {{ selectedProblem.suggestedFix }}
                      </p>
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
                  <span class="truncate font-mono text-zinc-400">{{ item.file }}</span
                  ><span
                    class="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-500"
                    >{{ item.reason.replaceAll('_', ' ').toLowerCase() }}</span
                  >
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
                  <dd class="mt-1 capitalize text-zinc-300">{{ scanSource }}</dd>
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
        </div>
      </main>

      <div v-if="showContact" class="modal-backdrop" @click.self="closeContact">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-title">
          <div class="flex items-start justify-between gap-5">
            <div>
              <p class="eyebrow text-emerald-400">Open channel</p>
              <h2 id="contact-title" class="mt-2 text-xl font-semibold text-white">
                Send feedback
              </h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500">
                Help us make repository reviews calmer and more useful.
              </p>
            </div>
            <button
              class="icon-button"
              type="button"
              aria-label="Close feedback form"
              @click="closeContact"
            >
              ×
            </button>
          </div>
          <div
            v-if="contactState === 'sent'"
            class="mt-8 rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-5"
          >
            <div class="text-2xl text-emerald-300">✓</div>
            <p class="mt-3 text-sm font-semibold text-white">Message sent.</p>
            <p class="mt-1 text-sm leading-6 text-zinc-400">
              Thanks for helping shape Repo Doctor.
            </p>
            <button class="button-secondary mt-5" type="button" @click="closeContact">Close</button>
          </div>
          <form v-else class="mt-7 space-y-4" @submit.prevent="sendMessage">
            <label class="field-label"
              >Your name<input
                v-model="contactForm.name"
                class="text-input"
                type="text"
                placeholder="Jane Doe" /></label
            ><label class="field-label"
              >Subject<input
                v-model="contactForm.subject"
                class="text-input"
                type="text"
                placeholder="A thought about findings" /></label
            ><label class="field-label"
              >Message<textarea
                v-model="contactForm.body"
                class="text-input min-h-28 resize-y"
                placeholder="What should we improve?"
              ></textarea>
            </label>
            <p v-if="contactError" class="text-xs text-rose-300">{{ contactError }}</p>
            <div class="flex justify-end gap-3 pt-2">
              <button
                class="button-secondary"
                type="button"
                :disabled="contactState === 'sending'"
                @click="closeContact"
              >
                Cancel</button
              ><button class="button-primary" type="submit" :disabled="contactState === 'sending'">
                <span v-if="contactState === 'sending'" class="spinner"></span
                >{{ contactState === 'sending' ? 'Sending…' : 'Send message' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-shell {
  background: #090a0d;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  width: 248px;
}

main {
  margin-left: 0;
}

@media (min-width: 1024px) {
  main {
    margin-left: 248px;
  }
}

.topbar {
  display: flex;
  height: 72px;
  align-items: center;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
  padding: 0 20px;
}

@media (min-width: 640px) {
  .topbar {
    padding: 0 32px;
  }
}

@media (min-width: 1024px) {
  .topbar {
    padding: 0 48px;
  }
}

.brand-mark {
  display: grid;
  height: 34px;
  width: 34px;
  place-items: center;
  border-radius: 11px;
  color: #07110e;
  background: linear-gradient(135deg, #a7f3d0, #5eead4);
  box-shadow: 0 0 28px rgb(52 211 153 / 0.16);
}

.brand-mark svg {
  height: 20px;
  width: 20px;
}

.brand-mark-small {
  height: 30px;
  width: 30px;
  border-radius: 9px;
}

.brand-mark-small svg {
  height: 18px;
  width: 18px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  line-height: 1.2;
  text-transform: uppercase;
  color: rgb(161 161 170 / 0.72);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  border-radius: 10px;
  padding: 10px 12px;
  color: rgb(161 161 170 / 0.8);
  font-size: 12px;
  transition: 160ms ease;
}

.nav-item:hover,
.nav-item-active {
  background: rgb(255 255 255 / 0.06);
  color: #f4f4f5;
}

.nav-item-active {
  box-shadow: inset 2px 0 #6ee7b7;
}

.nav-item svg {
  height: 17px;
  width: 17px;
}

.icon-button {
  display: grid;
  height: 34px;
  width: 34px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 10px;
  color: rgb(161 161 170 / 0.9);
  font-size: 20px;
  line-height: 1;
  transition: 160ms ease;
}

.icon-button:hover {
  border-color: rgb(255 255 255 / 0.16);
  background: rgb(255 255 255 / 0.05);
  color: #fff;
}

.icon-button svg {
  height: 16px;
  width: 16px;
}

.avatar {
  display: grid;
  height: 32px;
  width: 32px;
  place-items: center;
  border: 1px solid rgb(167 243 208 / 0.25);
  border-radius: 11px;
  background: rgb(52 211 153 / 0.1);
  color: #a7f3d0;
  font-size: 10px;
  font-weight: 600;
}

.hero-card {
  background: linear-gradient(120deg, #131a1a 0%, #101419 55%, #11131a 100%);
  box-shadow: 0 25px 80px rgb(0 0 0 / 0.22);
}

.hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.34;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-position:
    0 0,
    0 0;
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 45%, transparent 100%);
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  pointer-events: none;
}

.hero-orb-one {
  top: -130px;
  right: -70px;
  height: 360px;
  width: 360px;
  background: radial-gradient(circle, rgb(45 212 191 / 0.18), transparent 68%);
}

.hero-orb-two {
  right: 23%;
  bottom: -190px;
  height: 340px;
  width: 340px;
  background: radial-gradient(circle, rgb(52 211 153 / 0.08), transparent 68%);
}

.hero-pulse {
  position: absolute;
  right: 9%;
  top: 50%;
  z-index: 1;
  display: flex;
  height: 100px;
  width: 30%;
  align-items: center;
  gap: 7px;
  opacity: 0.65;
  transform: translateY(-25%);
}

.hero-pulse::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  background: rgb(110 231 183 / 0.14);
  content: '';
}

.hero-pulse span {
  position: relative;
  z-index: 1;
  display: block;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(#5eead4, #34d399);
  box-shadow: 0 0 16px rgb(52 211 153 / 0.5);
}

.hero-pulse span:nth-child(1),
.hero-pulse span:nth-child(3),
.hero-pulse span:nth-child(8),
.hero-pulse span:nth-child(10) {
  height: 20%;
}
.hero-pulse span:nth-child(2),
.hero-pulse span:nth-child(7),
.hero-pulse span:nth-child(9) {
  height: 34%;
}
.hero-pulse span:nth-child(4) {
  height: 62%;
}
.hero-pulse span:nth-child(5) {
  height: 95%;
}
.hero-pulse span:nth-child(6) {
  height: 42%;
}

.input-wrap {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 11px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 12px;
  background: rgb(4 8 9 / 0.48);
  padding: 0 15px;
  color: rgb(161 161 170 / 0.72);
  transition: 160ms ease;
}

.input-wrap:focus-within {
  border-color: rgb(110 231 183 / 0.5);
  box-shadow: 0 0 0 3px rgb(52 211 153 / 0.08);
}

.input-wrap svg {
  height: 17px;
  width: 17px;
  flex-shrink: 0;
}

.input-wrap input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e4e4e7;
  font-size: 13px;
}

.input-wrap input::placeholder {
  color: rgb(113 113 122 / 0.9);
}

.button-primary,
.button-secondary {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 11px;
  padding: 0 15px;
  font-size: 12px;
  font-weight: 600;
  transition: 160ms ease;
}

.button-primary {
  color: #08110e;
  background: #a7f3d0;
  box-shadow: 0 8px 24px rgb(52 211 153 / 0.12);
}

.button-primary:hover:not(:disabled) {
  background: #d1fae5;
  box-shadow: 0 9px 30px rgb(52 211 153 / 0.2);
  transform: translateY(-1px);
}

.button-secondary {
  border: 1px solid rgb(255 255 255 / 0.1);
  color: rgb(212 212 216 / 0.95);
  background: rgb(255 255 255 / 0.035);
}

.button-secondary:hover:not(:disabled) {
  border-color: rgb(255 255 255 / 0.17);
  background: rgb(255 255 255 / 0.07);
  color: #fff;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.button-primary svg,
.button-secondary svg {
  height: 15px;
  width: 15px;
}

.spinner {
  height: 13px;
  width: 13px;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stat-card,
.panel {
  border: 1px solid rgb(255 255 255 / 0.075);
  border-radius: 18px;
  background: rgb(17 18 23 / 0.72);
  box-shadow: 0 14px 40px rgb(0 0 0 / 0.1);
}

.stat-card {
  min-height: 148px;
  padding: 18px;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(161 161 170 / 0.62);
}

.filter-button {
  border-radius: 8px;
  padding: 6px 9px;
  color: rgb(161 161 170 / 0.75);
  font-size: 10px;
  transition: 160ms ease;
}

.filter-button:hover,
.filter-button-active {
  background: rgb(255 255 255 / 0.07);
  color: #f4f4f5;
}

.issue-row {
  padding: 17px 20px;
  transition: 160ms ease;
}

@media (min-width: 640px) {
  .issue-row {
    padding: 18px 24px;
  }
}

.issue-row:hover,
.issue-row-active {
  background: rgb(255 255 255 / 0.035);
}

.issue-row-active {
  box-shadow: inset 2px 0 rgb(110 231 183 / 0.75);
}

.severity-badge {
  display: grid;
  height: 28px;
  width: 28px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
}

.severity-critical {
  color: #fda4af;
  background: rgb(244 63 94 / 0.14);
}
.severity-high {
  color: #fb923c;
  background: rgb(249 115 22 / 0.13);
}
.severity-medium {
  color: #facc15;
  background: rgb(234 179 8 / 0.13);
}
.severity-low {
  color: #67e8f9;
  background: rgb(34 211 238 / 0.12);
}

.severity-text {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.category-pill {
  border: 1px solid rgb(255 255 255 / 0.07);
  border-radius: 5px;
  padding: 3px 6px;
  color: rgb(161 161 170 / 0.72);
  font-size: 9px;
  letter-spacing: 0.03em;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgb(3 5 6 / 0.78);
  padding: 20px;
  backdrop-filter: blur(10px);
}

.modal-card {
  width: min(100%, 470px);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 22px;
  background: #121419;
  padding: 24px;
  box-shadow: 0 24px 100px rgb(0 0 0 / 0.45);
}

.field-label {
  display: block;
  color: rgb(161 161 170 / 0.8);
  font-size: 11px;
  font-weight: 600;
}

.text-input {
  display: block;
  width: 100%;
  margin-top: 8px;
  border: 1px solid rgb(255 255 255 / 0.09);
  border-radius: 10px;
  outline: 0;
  background: rgb(255 255 255 / 0.035);
  padding: 11px 12px;
  color: #e4e4e7;
  font-size: 13px;
  font-weight: 400;
  transition: 160ms ease;
}

.text-input:focus {
  border-color: rgb(110 231 183 / 0.5);
  box-shadow: 0 0 0 3px rgb(52 211 153 / 0.08);
}

.text-input::placeholder {
  color: rgb(113 113 122 / 0.8);
}

.welcome-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 24px 32px;
  background:
    radial-gradient(circle at 75% 35%, rgb(31 104 84 / 0.13), transparent 24rem),
    radial-gradient(circle at 15% 100%, rgb(21 72 63 / 0.12), transparent 22rem);
}

.welcome-page::before {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size: 54px 54px;
  content: '';
  mask-image: linear-gradient(180deg, black, transparent 90%);
  pointer-events: none;
}

@media (min-width: 640px) {
  .welcome-page {
    padding: 28px 40px 40px;
  }
}

@media (min-width: 1024px) {
  .welcome-page {
    padding: 32px 64px 44px;
  }
}

.welcome-header,
.welcome-content,
.welcome-features {
  position: relative;
  z-index: 1;
  width: min(100%, 1240px);
  margin-right: auto;
  margin-left: auto;
}

.welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-content {
  display: grid;
  flex: 1;
  align-items: center;
  gap: 42px;
  padding: 72px 0 80px;
}

@media (min-width: 900px) {
  .welcome-content {
    grid-template-columns: minmax(0, 0.9fr) minmax(420px, 0.8fr);
    gap: 76px;
    padding: 48px 0 76px;
  }
}

.welcome-copy {
  max-width: 590px;
}

.welcome-title {
  max-width: 620px;
  margin-top: 20px;
  color: #f4f4f5;
  font-size: clamp(2.8rem, 6vw, 5.8rem);
  font-weight: 600;
  letter-spacing: -0.075em;
  line-height: 0.98;
}

.welcome-description {
  max-width: 510px;
  margin-top: 24px;
  color: rgb(161 161 170 / 0.88);
  font-size: 16px;
  line-height: 1.8;
}

.welcome-cta {
  min-height: 50px;
  margin-top: 34px;
  padding-right: 19px;
  padding-left: 19px;
  font-size: 13px;
}

.welcome-cta svg {
  height: 16px;
  width: 16px;
}

.welcome-note {
  margin-top: 14px;
  color: rgb(113 113 122 / 0.78);
  font-size: 11px;
}

.welcome-private-badge {
  min-height: 29px;
  align-items: center;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 999px;
  padding: 0 11px;
  color: rgb(161 161 170 / 0.72);
  font-size: 10px;
}

.welcome-visual {
  position: relative;
  display: grid;
  min-height: 390px;
  place-items: center;
}

.welcome-orbit {
  position: absolute;
  border: 1px solid rgb(110 231 183 / 0.13);
  border-radius: 999px;
  transform: rotate(-22deg);
}

.welcome-orbit-one {
  height: 330px;
  width: 520px;
}

.welcome-orbit-two {
  height: 450px;
  width: 450px;
  border-color: rgb(94 234 212 / 0.08);
  transform: rotate(34deg);
}

.welcome-scan-card {
  position: relative;
  z-index: 1;
  width: min(100%, 410px);
  border: 1px solid rgb(167 243 208 / 0.16);
  border-radius: 22px;
  background: linear-gradient(145deg, rgb(26 40 39 / 0.9), rgb(15 20 25 / 0.92));
  padding: 22px;
  box-shadow:
    0 30px 90px rgb(0 0 0 / 0.35),
    0 0 70px rgb(52 211 153 / 0.08);
  transform: rotate(3deg);
}

.welcome-card-dot {
  height: 7px;
  width: 7px;
  border-radius: 999px;
  background: #6ee7b7;
  box-shadow: 0 0 12px rgb(110 231 183 / 0.8);
}

.welcome-score {
  color: #f4f4f5;
  font-size: 54px;
  font-weight: 600;
  letter-spacing: -0.07em;
  line-height: 0.9;
}

.welcome-bars {
  display: flex;
  height: 54px;
  align-items: end;
  gap: 7px;
}

.welcome-bars span {
  flex: 1;
  min-width: 5px;
  border-radius: 999px 999px 2px 2px;
  background: linear-gradient(180deg, #5eead4, #34d399);
  box-shadow: 0 0 16px rgb(52 211 153 / 0.18);
}

.welcome-bars span:nth-child(1),
.welcome-bars span:nth-child(5),
.welcome-bars span:nth-child(9),
.welcome-bars span:nth-child(12) {
  height: 30%;
}
.welcome-bars span:nth-child(2),
.welcome-bars span:nth-child(7),
.welcome-bars span:nth-child(10) {
  height: 52%;
}
.welcome-bars span:nth-child(3),
.welcome-bars span:nth-child(6) {
  height: 72%;
}
.welcome-bars span:nth-child(4) {
  height: 45%;
}
.welcome-bars span:nth-child(8) {
  height: 92%;
}
.welcome-bars span:nth-child(11) {
  height: 64%;
}

.welcome-mini-stat {
  display: flex;
  min-height: 54px;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 0.07);
  border-radius: 10px;
  background: rgb(255 255 255 / 0.035);
  padding: 0 11px;
}

.welcome-mini-stat span {
  font-size: 16px;
  font-weight: 600;
}

.welcome-mini-stat small {
  margin-top: 3px;
  color: rgb(161 161 170 / 0.6);
  font-size: 9px;
  text-transform: uppercase;
}

.welcome-features {
  display: grid;
  gap: 12px;
  border-top: 1px solid rgb(255 255 255 / 0.07);
  padding-top: 25px;
}

@media (min-width: 760px) {
  .welcome-features {
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
}

.welcome-feature {
  display: flex;
  gap: 13px;
}

.welcome-feature-icon {
  display: grid;
  height: 29px;
  width: 29px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid rgb(110 231 183 / 0.16);
  border-radius: 9px;
  background: rgb(52 211 153 / 0.08);
  color: #6ee7b7;
  font-size: 14px;
}

.welcome-feature h2 {
  color: #e4e4e7;
  font-size: 12px;
  font-weight: 600;
}

.welcome-feature p {
  max-width: 250px;
  margin-top: 5px;
  color: rgb(113 113 122 / 0.84);
  font-size: 11px;
  line-height: 1.6;
}

.theme-toggle {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 8px;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 10px;
  padding: 0 10px;
  color: rgb(161 161 170 / 0.9);
  font-size: 11px;
  transition: 160ms ease;
}

.theme-toggle:hover {
  border-color: rgb(255 255 255 / 0.16);
  background: rgb(255 255 255 / 0.05);
  color: #fff;
}

.theme-toggle svg {
  height: 16px;
  width: 16px;
}

.theme-light {
  color: #1f2937;
  background: #f4f7f6;
}

.theme-light .welcome-page {
  background:
    radial-gradient(circle at 75% 35%, rgb(52 211 153 / 0.12), transparent 24rem),
    radial-gradient(circle at 15% 100%, rgb(45 212 191 / 0.09), transparent 22rem);
}

.theme-light .welcome-page::before {
  opacity: 0.6;
  background-image:
    linear-gradient(rgb(15 118 110 / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(15 118 110 / 0.06) 1px, transparent 1px);
}

.theme-light .welcome-title {
  color: #17201e;
}

.theme-light .welcome-description {
  color: #60706b;
}

.theme-light .welcome-note,
.theme-light .welcome-feature p {
  color: #72817c;
}

.theme-light .welcome-private-badge,
.theme-light .welcome-features {
  border-color: #dfe8e3;
}

.theme-light .welcome-private-badge {
  color: #71817a;
}

.theme-light .welcome-orbit {
  border-color: rgb(16 185 129 / 0.16);
}

.theme-light .welcome-orbit-two {
  border-color: rgb(20 184 166 / 0.11);
}

.theme-light .welcome-scan-card {
  border-color: rgb(16 185 129 / 0.2);
  background: linear-gradient(145deg, rgb(255 255 255 / 0.93), rgb(238 248 243 / 0.94));
  box-shadow:
    0 30px 90px rgb(35 67 52 / 0.14),
    0 0 70px rgb(52 211 153 / 0.1);
}

.theme-light .welcome-score,
.theme-light .welcome-feature h2 {
  color: #20332d;
}

.theme-light .welcome-mini-stat {
  border-color: #dfe8e3;
  background: rgb(255 255 255 / 0.72);
}

.theme-light .welcome-mini-stat small {
  color: #71817a;
}

.theme-light .sidebar {
  border-color: #e2e9e5;
  background: rgb(255 255 255 / 0.92);
}

.theme-light .topbar {
  border-color: #e2e9e5;
}

.theme-light .text-white {
  color: #17201e !important;
}

.theme-light .text-zinc-100 {
  color: #1f2937 !important;
}

.theme-light .text-zinc-200 {
  color: #29332f !important;
}

.theme-light .text-zinc-300 {
  color: #40504b !important;
}

.theme-light .text-zinc-400 {
  color: #60706b !important;
}

.theme-light .text-zinc-500 {
  color: #72817c !important;
}

.theme-light .text-zinc-600 {
  color: #89958f !important;
}

.theme-light .text-zinc-700 {
  color: #a7b0ab !important;
}

.theme-light [class*='border-white/'] {
  border-color: #dfe8e3 !important;
}

.theme-light [class*='bg-white/'] {
  background-color: rgb(255 255 255 / 0.68) !important;
}

.theme-light .nav-item {
  color: #687771;
}

.theme-light .nav-item:hover,
.theme-light .nav-item-active {
  background: #edf4f0;
  color: #20332d;
}

.theme-light .nav-item-active {
  box-shadow: inset 2px 0 #10b981;
}

.theme-light .icon-button,
.theme-light .theme-toggle {
  border-color: #dfe8e3;
  color: #62716b;
}

.theme-light .icon-button:hover,
.theme-light .theme-toggle:hover {
  border-color: #c8d7cf;
  background: #edf4f0;
  color: #20332d;
}

.theme-light .avatar {
  border-color: rgb(16 185 129 / 0.25);
  background: rgb(16 185 129 / 0.1);
  color: #047857;
}

.theme-light .hero-card {
  border-color: #dce8e1;
  background: linear-gradient(120deg, #f0f8f4 0%, #f4f8f7 55%, #eef6f4 100%);
  box-shadow: 0 25px 80px rgb(35 67 52 / 0.1);
}

.theme-light .hero-grid {
  opacity: 0.48;
  background-image:
    linear-gradient(rgb(15 118 110 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgb(15 118 110 / 0.08) 1px, transparent 1px);
}

.theme-light .hero-orb-one {
  background: radial-gradient(circle, rgb(45 212 191 / 0.14), transparent 68%);
}

.theme-light .hero-orb-two {
  background: radial-gradient(circle, rgb(52 211 153 / 0.12), transparent 68%);
}

.theme-light .hero-pulse {
  opacity: 0.8;
}

.theme-light .hero-pulse::before {
  background: rgb(13 148 136 / 0.18);
}

.theme-light .input-wrap {
  border-color: #cbdcd3;
  background: rgb(255 255 255 / 0.72);
  color: #6b7d75;
}

.theme-light .input-wrap:focus-within {
  border-color: rgb(16 185 129 / 0.6);
  box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1);
}

.theme-light .input-wrap input {
  color: #20332d;
}

.theme-light .input-wrap input::placeholder {
  color: #8b9a94;
}

.theme-light .button-primary {
  color: #06372b;
  background: #6ee7b7;
}

.theme-light .button-primary:hover:not(:disabled) {
  background: #a7f3d0;
}

.theme-light .button-secondary {
  border-color: #d4e1da;
  color: #4a5b54;
  background: rgb(255 255 255 / 0.7);
}

.theme-light .button-secondary:hover:not(:disabled) {
  border-color: #bfd2c7;
  background: #edf4f0;
  color: #20332d;
}

.theme-light .stat-card,
.theme-light .panel {
  border-color: #dfe8e3;
  background: rgb(255 255 255 / 0.82);
  box-shadow: 0 14px 40px rgb(35 67 52 / 0.06);
}

.theme-light .stat-label,
.theme-light .eyebrow {
  color: #71817a;
}

.theme-light .filter-button {
  color: #71817a;
}

.theme-light .filter-button:hover,
.theme-light .filter-button-active {
  background: #edf4f0;
  color: #20332d;
}

.theme-light .issue-row:hover,
.theme-light .issue-row-active {
  background: #f2f8f5;
}

.theme-light .issue-row-active {
  box-shadow: inset 2px 0 rgb(16 185 129 / 0.85);
}

.theme-light .category-pill {
  border-color: #dfe8e3;
  color: #71817a;
}

.theme-light .modal-backdrop {
  background: rgb(26 40 34 / 0.38);
}

.theme-light .modal-card {
  border-color: #dfe8e3;
  background: #ffffff;
  box-shadow: 0 24px 100px rgb(35 67 52 / 0.18);
}

.theme-light .text-input {
  border-color: #d5e1da;
  background: #f7faf8;
  color: #20332d;
}

.theme-light .text-input:focus {
  border-color: rgb(16 185 129 / 0.6);
  box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1);
}

.theme-light .text-input::placeholder {
  color: #8b9a94;
}
</style>
