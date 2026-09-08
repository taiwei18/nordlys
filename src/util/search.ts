export interface SearchDocument {
  title: string
  description: string
  tags: string[]
  url: string
}

export interface SearchResult {
  title: string
  excerpt: string
  url: string
}

const normalize = (value: string) => value.toLocaleLowerCase()

export function searchDocuments(
  documents: SearchDocument[],
  query: string
): SearchResult[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)

  if (!terms.length) return []

  return documents
    .map((document, index) => {
      const title = normalize(document.title)
      const description = normalize(document.description)
      const tags = normalize(document.tags.join(' '))

      if (
        !terms.every(
          (term) =>
            title.includes(term) ||
            tags.includes(term) ||
            description.includes(term)
        )
      )
        return null

      const score = terms.reduce((total, term) => {
        if (title.includes(term)) return total + 3
        if (tags.includes(term)) return total + 2
        return total + 1
      }, 0)

      return { document, index, score }
    })
    .filter((match): match is NonNullable<typeof match> => match !== null)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ document }) => ({
      title: document.title,
      excerpt: document.description,
      url: document.url
    }))
}
