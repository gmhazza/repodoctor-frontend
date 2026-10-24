<script setup>
import { computed, ref } from 'vue'
import AnalyzerHeader from '@/components/AnalyzerHeader.vue'
import AnalyzerSidebar from '@/components/AnalyzerSidebar.vue'
import FeedbackModal from '@/components/FeedbackModal.vue'
import FindingsPanel from '@/components/FindingsPanel.vue'
import RepositoryHero from '@/components/RepositoryHero.vue'
import ScanDetails from '@/components/ScanDetails.vue'
import ScanOverview from '@/components/ScanOverview.vue'
import { analyzeRepository as requestAnalysis } from '@/services/api'

const repository = ref('')
const analysis = ref({
  summary: {},
  problems: [],
  skippedFiles: [],
  failedFiles: [],
})
const selectedProblem = ref(null)
const activeFilter = ref('all')
const isAnalyzing = ref(false)
const errorMessage = ref('')
const scanSource = ref('not-run')
const showContact = ref(false)

const filters = [
  { id: 'all', label: 'All issues' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

const repositoryName = computed(() => {
  if (!analysis.value?.repository) return 'Repository'
  return `${analysis.value.repository.owner}/${analysis.value.repository.name}`
})

async function analyze() {
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
    const payload = await requestAnalysis(value)
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
</script>

<template>
  <div class="analysis-layout">
    <AnalyzerSidebar
      :problem-count="analysis?.summary?.problems || 0"
      @feedback="showContact = true"
    />
    <main class="min-w-0 flex-1">
      <AnalyzerHeader @feedback="showContact = true" />
      <div id="overview" class="mx-auto max-w-[1450px] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <RepositoryHero
          v-model:repository="repository"
          :is-analyzing="isAnalyzing"
          :error-message="errorMessage"
          @analyze="analyze"
        />
        <ScanOverview
          :analysis="analysis"
          :repository-name="repositoryName"
          :scan-source="scanSource"
          :is-analyzing="isAnalyzing"
          @analyze="analyze"
        />
        <FindingsPanel
          :problems="analysis?.problems || []"
          :selected-problem="selectedProblem"
          :active-filter="activeFilter"
          :filters="filters"
          @select="selectedProblem = $event"
          @filter="activeFilter = $event"
        />
        <ScanDetails
          :analysis="analysis"
          :repository-name="repositoryName"
          :scan-source="scanSource"
        />
      </div>
    </main>
    <FeedbackModal :open="showContact" @close="showContact = false" />
  </div>
</template>
