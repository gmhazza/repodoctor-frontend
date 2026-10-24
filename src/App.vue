<script setup>
import { useTheme } from '@/composables/useTheme'

const { themeMode } = useTheme()
</script>

<template>
  <div :class="['app-shell min-h-screen text-zinc-100', `theme-${themeMode}`]">
    <RouterView />
  </div>
</template>
