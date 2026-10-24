<script setup>
import { ref } from 'vue'
import { sendFeedback } from '@/services/api'

defineProps({
  open: Boolean,
})

const emit = defineEmits(['close'])
const state = ref('idle')
const error = ref('')
const form = ref({ name: '', subject: '', body: '' })

function close() {
  if (state.value !== 'sending') emit('close')
}

async function submit() {
  error.value = ''
  if (!form.value.name || !form.value.subject || !form.value.body) {
    error.value = 'Complete all fields before sending your message.'
    return
  }

  state.value = 'sending'

  try {
    await sendFeedback(form.value)
    state.value = 'sent'
    form.value = { name: '', subject: '', body: '' }
  } catch (requestError) {
    state.value = 'error'
    error.value = requestError.message || 'The message could not be sent.'
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="close">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <div class="flex items-start justify-between gap-5">
        <div>
          <p class="eyebrow text-emerald-400">Open channel</p>
          <h2 id="contact-title" class="mt-2 text-xl font-semibold text-white">Send feedback</h2>
          <p class="mt-2 text-sm leading-6 text-zinc-500">
            Help us make repository reviews calmer and more useful.
          </p>
        </div>
        <button class="icon-button" type="button" aria-label="Close feedback form" @click="close">
          ×
        </button>
      </div>

      <div
        v-if="state === 'sent'"
        class="mt-8 rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-5"
      >
        <div class="text-2xl text-emerald-300">✓</div>
        <p class="mt-3 text-sm font-semibold text-white">Message sent.</p>
        <p class="mt-1 text-sm leading-6 text-zinc-400">Thanks for helping shape Repo Doctor.</p>
        <button class="button-secondary mt-5" type="button" @click="close">Close</button>
      </div>

      <form v-else class="mt-7 space-y-4" @submit.prevent="submit">
        <label class="field-label">
          Your name
          <input v-model="form.name" class="text-input" type="text" placeholder="Jane Doe" />
        </label>
        <label class="field-label">
          Subject
          <input
            v-model="form.subject"
            class="text-input"
            type="text"
            placeholder="A thought about findings"
          />
        </label>
        <label class="field-label">
          Message
          <textarea
            v-model="form.body"
            class="text-input min-h-28 resize-y"
            placeholder="What should we improve?"
          ></textarea>
        </label>
        <p v-if="error" class="text-xs text-rose-300">{{ error }}</p>
        <div class="flex justify-end gap-3 pt-2">
          <button
            class="button-secondary"
            type="button"
            :disabled="state === 'sending'"
            @click="close"
          >
            Cancel
          </button>
          <button class="button-primary" type="submit" :disabled="state === 'sending'">
            <span v-if="state === 'sending'" class="spinner"></span>
            {{ state === 'sending' ? 'Sending…' : 'Send message' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
