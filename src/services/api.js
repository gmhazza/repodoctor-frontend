const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function analyzeRepository(repository) {
  const response = await fetch(`${apiBaseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repository }),
  })

  if (!response.ok) {
    throw new Error(`The analysis request failed with status ${response.status}.`)
  }

  const payload = await response.json()
  if (!payload.summary || !Array.isArray(payload.problems)) {
    throw new Error('The API returned an unexpected analysis format.')
  }

  return payload
}

export async function sendFeedback(payload) {
  const response = await fetch(`${apiBaseUrl}/mail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error('The message could not be sent.')
  return response.json()
}
