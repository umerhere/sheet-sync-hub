'use client'

import { useState } from 'react'

export default function GetAllSheetsButton({
  pages,
  domainFilter,
  languageFilter
}: {
  pages: any[]
  domainFilter: string
  languageFilter: string
}) {
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([])
  const [selectedSheetId, setSelectedSheetId] = useState('')

  // 🔹 Apply filters passed from parent
  const filteredPages = pages.filter(
    (page) =>
      (page.domain === domainFilter || domainFilter === '') &&
      (page.language === languageFilter || languageFilter === '')
  )

  console.log("umar filteredPages", filteredPages);
  console.log("umar domainFilter", domainFilter);
  console.log("umar lanugageFilter", languageFilter);
  const getSheets = async () => {
    try {
      const res = await fetch('/api/google/sheets')
      const data = await res.json()

      if (res.ok) {
        console.log('✅ Google Sheets:', data.files)
        setSheets(data.files || [])
      } else {
        console.error('❌ Error:', data.error)
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
    }
  }

  const handleImport = async () => {
    const res = await fetch('/api/google/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId: selectedSheetId,
        pages: filteredPages,
        domainFilter,
        languageFilter
      })
    })

    const data = await res.json()
    console.log('✅ Import Response:', data)

  //   await fetch('/api/google/sync-sheets', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     sheetId: selectedSheetId,
  //     pages: filteredPages,
  //     domainFilter,
  //     languageFilter
  //   })
  // })

  }


  return (
    <div>
      <button
        onClick={getSheets}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Get All Google Sheets
      </button>

      {sheets.length > 0 && (
        <div className="mt-4 space-y-4">
          <select
            className="p-2 border rounded w-full"
            value={selectedSheetId}
            onChange={(e) => setSelectedSheetId(e.target.value)}
          >
            <option value="">-- Select Sheet to import data --</option>
            {sheets.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>
                {sheet.name}
              </option>
            ))}
          </select>

          {selectedSheetId && (
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Import Selected Sheet
            </button>
          )}
        </div>
      )}
    </div>
  )
}
