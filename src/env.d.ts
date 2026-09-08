interface PagefindResultData {
  url: string
  meta: { title: string }
  excerpt: string
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>
}

interface PagefindApi {
  search: (
    query: string,
    options?: { filters?: Record<string, string | string[]> }
  ) => Promise<{ results: PagefindResult[] }>
}

interface Window {
  mode: {
    setMode: (mode: 'dark' | 'light') => void
    getMode: () => 'dark' | 'light'
  }

  pagefind?: PagefindApi
  pagefindPromise?: Promise<PagefindApi | null>
}
