'use client'

import { useEffect, useState } from 'react'

export default function GetHubspotPages() {
  const [pages, setPages] = useState([])

  const fetchPages = async () => {
  const res = await fetch('/api/hubspot/pages')
  const data = await res.json()
    console.log("umar API response", data);

  if (res.ok) {
    const enrichedPages = (data.pages || []).map((page: any) => ({
      id: page.id,
      name: page.name,
      slug: page.slug || '',
      url: page.url,
      domain: page.url ? new URL(page.url).hostname : '',
      language: page.language || '', // fallback if missing
    }))
    console.log("umar fetched pages", enrichedPages);
    setPages(enrichedPages)
  } else {
    console.error('❌ Error:', data.error || data.details)
  }
}

// useEffect(() => {
//   fetchPages()
// }, [])

  return (
    <div className="space-y-4 mt-6">
      <button
        onClick={fetchPages}
        className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
      >
        Fetch HubSpot Pages
      </button>

     {pages.length > 0 && (
  <table className="table-auto w-full border mt-4 text-sm">
    <thead>
      <tr className=" text-left">
        <th className="p-2 border">Name</th>
        <th className="p-2 border">Slug</th>
        <th className="p-2 border">Domain</th>
        <th className="p-2 border">Language</th>
      </tr>
    </thead>
    <tbody>
      {pages.map((page: any) => (
        <tr key={page.id}>
          <td className="p-2 border">{page.name}</td>
          <td className="p-2 border">{page.slug || page.url}</td>
          <td className="p-2 border">{page.domain}</td>
          <td className="p-2 border">{page.language}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  )
}
