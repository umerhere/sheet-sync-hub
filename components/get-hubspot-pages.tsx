'use client'

export default function GetHubspotPages({
  pages,
  setPages,
  domainFilter,
  setDomainFilter,
  languageFilter,
  setLanguageFilter,
}: {
  pages: any[]
  setPages: (pages: any[]) => void
  domainFilter: string
  setDomainFilter: (val: string) => void
  languageFilter: string
  setLanguageFilter: (val: string) => void
}) {
  const fetchPages = async () => {
    const res = await fetch('/api/hubspot/pages')
    const data = await res.json()

    if (res.ok) {
      const enrichedPages = (data.pages || []).map((page: any) => ({
        id: page.id,
        name: page.name || '',
        slug: page.slug || '',
        url: page.url || '',
        domain: page.url ? new URL(page.url).hostname : '',
        language: page.language || '',
      }))
      setPages(enrichedPages)
    } else {
      console.error('❌ Error:', data.error || data.details)
    }
  }

  const filteredPages = pages.filter(
    (page) =>
      (domainFilter === '' || page.domain === domainFilter) &&
      (languageFilter === '' || page.language === languageFilter)
  )

  return (
    <div className="space-y-4 mt-6">
      <button
        onClick={fetchPages}
        className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
      >
        Fetch HubSpot Pages
      </button>

      <div className="flex gap-4 my-2">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Domains</option>
          {[...new Set(pages.map((p) => p.domain))].map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Languages</option>
          {[...new Set(pages.map((p) => p.language || ''))].map((lang) => (
            <option key={lang} value={lang}>
              {lang || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      {filteredPages.length > 0 && (
        <table className="table-auto w-full border mt-4 text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Slug</th>
              <th className="p-2 border">Domain</th>
              <th className="p-2 border">Language</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page: any) => (
              <tr key={page.id}>
                <td className="p-2 border">{page.name || '—'}</td>
                <td className="p-2 border">{page.slug || page.url || '—'}</td>
                <td className="p-2 border">{page.domain || '—'}</td>
                <td className="p-2 border">{page.language || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
