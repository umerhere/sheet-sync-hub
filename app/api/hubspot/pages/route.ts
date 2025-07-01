import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET (req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 1. Get the stored HubSpot token
  const { data: tokenRow, error: tokenError } = await supabase
    .from('hubspot_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .single()

  if (!tokenRow || tokenError) {
    return NextResponse.json({ error: 'No token found' }, { status: 404 })
  }

  // 2. Fetch pages from HubSpot
  try {
    const hubspotRes = await fetch(
      'https://api.hubapi.com/cms/v3/pages/site-pages',
      {
        headers: {
          Authorization: `Bearer ${tokenRow.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await hubspotRes.json()

    if (!hubspotRes.ok) {
      console.log('error fetching HubSpot pages:', data)
      return NextResponse.json(
        { error: 'HubSpot fetch failed', details: data },
        { status: 500 }
      )
    }

    return NextResponse.json({ pages: data.results }) // List of published pages
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: err },
      { status: 500 }
    )
  }
}
