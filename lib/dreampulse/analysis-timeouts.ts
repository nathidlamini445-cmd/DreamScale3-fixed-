/** Server-side Gemini call timeout (scrape runs before this). */
export const DREAMPULSE_GEMINI_TIMEOUT_MS = 180_000

/** Browser fetch must exceed scrape + Gemini + retries. */
export const DREAMPULSE_CLIENT_TIMEOUT_MS = 210_000

/** Cap scraped HTML sent to Gemini (smaller = faster analysis). */
export const DREAMPULSE_SCRAPE_EXCERPT_CHARS = 10_000
