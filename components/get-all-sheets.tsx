'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

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
  const [loadingSheets, setLoadingSheets] = useState(false)
  const [loadingImports, setLoadingImports] = useState(false)

  // 🔹 Apply filters passed from parent
  const filteredPages = pages.filter(
    (page) =>
      (page.domain === domainFilter || domainFilter === '') &&
      (page.language === languageFilter || languageFilter === '')
  )
  const getSheets = async () => {
    try {
      setLoadingSheets(true);
      const res = await fetch('/api/google/sheets')
      const data = await res.json()
      if (data.error && data.error.code == 401) {
        toast.error('Please connect your google account again')
      setLoadingSheets(false);
        return;
      }
      if (res.ok) {
        setSheets(data.files || [])
      } else {
        console.error('❌ Error:', data.error)
      }
      toast.success('Successfully fetched Google Sheets')
    } catch (err) {
      console.error('❌ Unexpected error:', err)
    } finally {
      setLoadingSheets(false);

    }
  }

  const handleImport = async () => {
    try {
      setLoadingImports(true)
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
      if (data.updateData.error) {
        if (data.updateData.error.code === 403) {
          toast.error('You do not have permission to write to this sheet')
        } else if (data.updateData.error.code === 404) {
          toast.error('Sheet not found or you do not have access')
        } else if (data.updateData.error.code === 400) {
          toast.error('Invalid request. Please check the sheet ID and try again')
        }  else if (data.updateData.error.code === 401) {
          toast.error('Please connect your google account and try again')
        } else {
          toast.error(`Error importing data: ${data.updateData.error.message}`)
        }
        setLoadingImports(false)
        return
      }
      if (res.ok && !data.updateData.error) {
        toast.success('Successfully imported data from Google Sheet')
        setSelectedSheetId('')
      }  
    }
    catch (error) {
      toast.error('Failed to import data from Google Sheet')
      console.error('❌ Import Error:', error)
    }
    finally {
      setLoadingImports(false)
    }
    
  }


  return (
    <div>
      <button
        disabled={loadingSheets}
        onClick={getSheets}
        className={`px-4 py-2 rounded  text-white ${!loadingSheets ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600' } `}
      >
        {loadingSheets ? "Loading Sheets..." : "Fetch Connected Sheets"}
      </button>

      {sheets.length > 0 && (
        <div className="mt-4 space-y-4">
          <select
            className="p-2 border rounded w-full"
            value={selectedSheetId}
            onChange={(e) => setSelectedSheetId(e.target.value)}
          >
            <option value="">-- Choose a Sheet to Sync Data --</option>
            {sheets.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>
                {sheet.name}
              </option>
            ))}
          </select>

          {pages.length > 0 && selectedSheetId && (
            <button
              onClick={handleImport}
              className={`px-4 py-2 rounded text-white ${!loadingImports ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600' }`}
            >
              {loadingImports ? "Please wait..." : "Sync Filtered Pages to Selected Sheet"}
              
            </button>
          )}
        </div>
      )}
    </div>
  )
}
