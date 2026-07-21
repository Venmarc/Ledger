const MRU_KEY = 'ledger-category-mru'
const MAX = 12

/** Most-recently-used category ids for Quick Add pill ordering. */
export function getMruCategoryIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(MRU_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function pushMruCategoryId(id: string): void {
  if (typeof window === 'undefined' || !id) return
  try {
    const prev = getMruCategoryIds().filter((x) => x !== id)
    const next = [id, ...prev].slice(0, MAX)
    localStorage.setItem(MRU_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
}
