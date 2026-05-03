/**
 * IQ 175 Resilient Fetch Utility
 * Implements exponential backoff, retry logic, and timeout.
 */

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoff: number = 500
): Promise<Response> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s default timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok && retries > 0 && response.status >= 500) {
      console.warn(`Fetch failed with ${response.status}. Retrying in ${backoff}ms... (${retries} left)`)
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    
    return response
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch error: ${error}. Retrying in ${backoff}ms... (${retries} left)`)
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    throw error
  }
}
