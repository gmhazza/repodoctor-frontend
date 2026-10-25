const defaultSeo = {
  title: 'Repo Doctor · Code health, simplified',
  description:
    'Review public GitHub repositories, find important issues, and get practical fixes with Repo Doctor.',
  robots: 'index, follow',
  type: 'website',
}

function siteOrigin() {
  const configuredOrigin = import.meta.env.VITE_SITE_URL

  if (configuredOrigin) return configuredOrigin.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

function upsertMeta(attribute, key, content) {
  if (typeof document === 'undefined') return

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (typeof document === 'undefined') return

  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertStructuredData(data) {
  if (typeof document === 'undefined') return

  const id = 'repo-doctor-structured-data'
  let element = document.getElementById(id)
  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

export function updateSeo(route) {
  if (typeof document === 'undefined') return

  const seo = { ...defaultSeo, ...(route.meta?.seo || {}) }
  const origin = siteOrigin()
  const canonicalUrl = origin ? `${origin}${route.fullPath}` : ''

  document.title = seo.title
  upsertMeta('name', 'description', seo.description)
  upsertMeta('name', 'robots', seo.robots)
  upsertMeta('property', 'og:title', seo.title)
  upsertMeta('property', 'og:description', seo.description)
  upsertMeta('property', 'og:type', seo.type)
  upsertMeta('property', 'og:site_name', 'Repo Doctor')
  upsertMeta('property', 'og:url', canonicalUrl)
  upsertMeta('name', 'twitter:card', 'summary')
  upsertMeta('name', 'twitter:title', seo.title)
  upsertMeta('name', 'twitter:description', seo.description)
  upsertLink('canonical', seo.robots.includes('noindex') ? '' : canonicalUrl)

  if (seo.structuredData) {
    upsertStructuredData({ ...seo.structuredData, url: canonicalUrl || seo.structuredData.url })
  } else {
    document.getElementById('repo-doctor-structured-data')?.remove()
  }
}
