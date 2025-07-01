import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function GET (req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  console.log('🔎 Current user email:', user.email)

  const { data: tokenRow, error } = await supabase
    .from('google_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    // .order('created_at', { ascending: true }) // latest first
    .limit(1)
    .maybeSingle()

  console.log('data from google_tokens', tokenRow)
  console.log('error from google_tokens', error)
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
  const sheetName = `Import_${new Date().toISOString().slice(0, 10)}`

  // 🔍 Step 1: Get existing sheets to see if this tab already exists
  const metadataRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  const metadata = await metadataRes.json()
  const tabExists = metadata.sheets?.some(
    (sheet: any) => sheet.properties.title === sheetName
  )

  // 🧩 Step 2: If tab doesn't exist, create it
  if (!tabExists) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: { title: sheetName }
              }
            }
          ]
        })
      }
    )
  }

  // ✅ Step 3: Format data
  const headers = ['ID', 'Title', 'Slug', 'Language', 'Domain']
  const values = [
    ...(tabExists ? [] : [headers]), // only add headers if tab is new
    ...pages.map(p => [p.id, p.name, p.slug, p.language, p.domain])
  ]

  // 📝 Step 4: Write to the sheet tab
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

  const updateData = await updateRes.json()

  // ✅ Step 5: Store sync session in Supabase
  const { error: syncError } = await supabase.from('sync_sessions').insert([
    {
      user_id: user.id,
      sheet_id: sheetId,
      tab_name: sheetName,
      content_type: 'pages',
      filters_used: JSON.stringify({
        domain: domainFilter,
        language: languageFilter
      }),
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
