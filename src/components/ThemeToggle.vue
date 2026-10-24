<script setup>
import { useTheme } from '@/composables/useTheme'

const { themeMode, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <span class="theme-switch" :class="`theme-switch-${themeMode}`" aria-hidden="true">
      <span class="theme-switch-track">
        <Transition name="theme-icon" mode="out-in">
          <svg v-if="themeMode === 'dark'" key="dark" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else key="light" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
            <path
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
            />
          </svg>
        </Transition>
      </span>
    </span>
    <span class="hidden sm:inline">{{ themeMode === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
  </button>
</template>
