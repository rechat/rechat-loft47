// app/core/libs/apiFetch.ts
type ApiFetchOptions = RequestInit & { parseJson?: boolean }

// const BASE_URL = 'https://loft47.cluster.rechat.com'
const BASE_URL = 'http://localhost:8081'

/**
 * A wrapper around the browser's fetch that automatically:
 *   • prefixes the base URL
 *   • returns parsed JSON by default
 *
 * Usage:
 *   const data = await apiFetch('/loft47/brokerages');            // GET
 *   const users = await apiFetch('/users', { method: 'POST', body: JSON.stringify({ name: 'Bob' }) });
 *   const rawRes = await apiFetch('https://other.com/health', { parseJson: false }); // keep Response
 */
export async function apiFetch(
  endpoint: string,
  { parseJson = true, ...options }: ApiFetchOptions = {}
) {
  // If caller already supplied a full URL, keep it; otherwise prepend base
  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : BASE_URL + endpoint

  const res = await fetch(url, {
    credentials: 'include',
    ...options
  })

  if (!res.ok) {
    const body = await res
      .clone()
      .json()
      .catch(() => null) // try parse JSON
    const err = new Error(res.statusText) as any

    err.status = res.status
    err.body = body
    throw err
  }

  return parseJson ? res.json() : res
}
