'use client'

import { useState } from 'react'
import GetHubspotPages from '@/components/get-hubspot-pages'
import GetAllSheetsButton from '@/components/get-all-sheets'

export default function HubspotGSheetConnector() {
  const [pages, setPages] = useState([])
  const [domainFilter, setDomainFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')

  return (
    <div className="p-4 space-y-8">
      <GetHubspotPages
        pages={pages}
        setPages={setPages}
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
      />

      <GetAllSheetsButton
        pages={pages}
        domainFilter={domainFilter}
        languageFilter={languageFilter}
      />
    </div>
  )
}
