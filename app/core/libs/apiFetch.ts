// app/core/libs/apiFetch.ts
type ApiFetchOptions = RequestInit & { parseJson?: boolean }

const BASE_URL = 'https://loft47.cluster.rechat.com'
// const BASE_URL = 'http://localhost:8081'

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
      : BASE_URL + endpoint;

  console.log('--------------------------------')
  console.log('URL:', url)
  console.log('Options:', options)
  const res = await fetch(url, options);
  console.log('Body:', res.body)

  // Surface non-2xx as exceptions so calling code can catch them
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${errText}`);
  }

  return parseJson ? res.json() : res;   // default: parsed JSON
}