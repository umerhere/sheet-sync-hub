import { createClient } from '@/lib/supabase/server'
import { formatReadableDate, getContentTypesSummary } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { styleSheetTab } from './styleSheetTab'

export async function GET () {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: tokenRow, error } = await supabase
    .from('google_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .limit(1)
    .maybeSingle()

  if (error || !tokenRow) {
    return NextResponse.json(
      { error: 'No Google token found' },
      { status: 404 }
    )
  }

  const googleRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${tokenRow?.access_token}`
      }
    }
  )

  const data = await googleRes.json()
  return NextResponse.json(data)
}

//
// ✅ POST → Import dummy HubSpot pages to selected sheet
//

export async function POST (req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { sheetId, pages, domainFilter, languageFilter } = await req.json()

  const { data: tokenRow } = await supabase
    .from('google_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!tokenRow) {
    return NextResponse.json(
      { error: 'No Google token found' },
      { status: 404 }
    )
  }

  const token = tokenRow.access_token
  const sheetName = `HubSpotPages_${new Date().toISOString().slice(0, 10)}`

  // Step 1: Get existing sheets
  const metadataRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!metadataRes.ok) {
    const error = await metadataRes.json().catch(() => ({
      error: {
        code: metadataRes.status,
        message: 'Failed to fetch sheet metadata'
      }
    }))
    return NextResponse.json(
      { updateData: { error: error.error } },
      { status: error.error.code || 500 }
    )
  }

  const metadata = await metadataRes.json()
  type Sheet = { properties: { title: string } }
  const tabExists = metadata.sheets?.some(
    (sheet: Sheet) => sheet.properties.title === sheetName
  )

  const headers: string[] = [
    'Name',
    'Author Name',
    'Language',
    'Slug',
    'Content Type',
    'URL',
    'Published Date',
    'Last Updated'
  ]

  let sheetIdNum: number | undefined = undefined

  // Step 2: Create tab if needed
  if (!tabExists) {
    const addSheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: sheetName } } }],
          includeSpreadsheetInResponse: true,
          responseIncludeGridData: false
        })
      }
    )

    if (!addSheetRes.ok) {
      const error = await addSheetRes.json().catch(() => ({
        error: {
          code: addSheetRes.status,
          message: 'Failed to create sheet tab'
        }
      }))
      return NextResponse.json(
        { updateData: { error: error.error } },
        { status: error.error.code || 500 }
      )
    }

    const addSheetData = await addSheetRes.json()
    sheetIdNum = addSheetData.replies?.[0]?.addSheet?.properties?.sheetId

    if (!sheetIdNum) {
      return NextResponse.json(
        {
          updateData: {
            error: {
              code: 500,
              message: 'Failed to retrieve new sheet ID after creation.'
            }
          }
        },
        { status: 500 }
      )
    }

    // Step 2.2: Style the tab
    try {
      await styleSheetTab({ sheetId, tabSheetId: sheetIdNum, headers, token })
    } catch (err) {
      console.error('❌ styleSheetTab error:', err)
      return NextResponse.json(
        {
          updateData: {
            error: { code: 500, message: 'Failed to style the new tab.' }
          }
        },
        { status: 500 }
      )
    }
  }

  // Step 3: Prepare values
  interface Page {
    name: string
    authorName: string
    language: string
    slug: string
    content: string
    url: string
    updatedAt: string
    publishedAt: string
  }

  const sheetTitle = `HubSpot Pages Sync — ${new Date().toLocaleDateString()}`

  const values: string[][] = [
    ...(tabExists ? [] : [[sheetTitle], headers]),
    ...pages.map((p: Page) => [
      p.name,
      p.authorName,
      p.language,
      p.slug,
      p.content,
      p.url,
      formatReadableDate(p.publishedAt),
      formatReadableDate(p.updatedAt)
    ])
  ]

  // Step 4: Append values
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      sheetName
    )}!A1:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  )

  if (!updateRes.ok) {
    const error = await updateRes.json().catch(() => ({
      error: {
        code: updateRes.status,
        message: 'Failed to write values to sheet'
      }
    }))
    return NextResponse.json(
      { updateData: { error: error.error } },
      { status: error.error.code || 500 }
    )
  }

  const updateData = await updateRes.json()

  // Step 5: Store sync session
  const { error: syncError } = await supabase.from('sync_sessions').insert([
    {
      user_id: user.id,
      sheet_id: sheetId,
      tab_name: sheetName,
      content_type: getContentTypesSummary(pages),
      filters_used: JSON.stringify({
        domain: domainFilter,
        language: languageFilter
      }),
      rows_added: pages.length,
      timestamp: new Date().toISOString()
    }
  ])

  if (syncError) {
    console.error('❌ Failed to log sync session:', syncError)
    return NextResponse.json(
      { error: 'Failed to store sync metadata', details: syncError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, updateData })
}
