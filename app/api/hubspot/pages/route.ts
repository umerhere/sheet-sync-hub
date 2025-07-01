import { /* NextRequest, */ NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function getPublishedPages () {
  const supabase = await createClient()
  // ✅ Get current logged-in user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    console.error('Auth error:', authError)
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    )
  }

  // ✅ Fetch user's stored HubSpot token
  const { data: tokenRow, error: fetchError } = await supabase
    .from('hubspot_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !tokenRow?.access_token) {
    console.error('Token fetch error:', fetchError)
    return NextResponse.json(
      { error: 'No HubSpot token found for this user' },
      { status: 404 }
    )
  }

  // ✅ Call HubSpot API to get published pages
  try {
    const hubspotRes = await fetch(
      'https://api.hubapi.com/cms/v3/pages/site-pages',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenRow.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const result = await hubspotRes.json()

    return NextResponse.json({ pages: result })
  } catch (err) {
    console.error('HubSpot API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pages from HubSpot', details: err },
      { status: 500 }
    )
  }
}
