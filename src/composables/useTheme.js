import { ref } from 'vue'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'

  try {
    return window.localStorage.getItem('repo-doctor-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

const themeMode = ref(getInitialTheme())

function applyTheme(mode) {
  themeMode.value = mode

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = mode
    document.documentElement.style.colorScheme = mode
  }

  try {
    window.localStorage.setItem('repo-doctor-theme', mode)
  } catch {
    // Theme switching still works when storage is unavailable.
  }
}

function toggleTheme() {
  applyTheme(themeMode.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return { themeMode, applyTheme, toggleTheme }
}
