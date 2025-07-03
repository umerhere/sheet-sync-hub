import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const pageTypes = [
  { type: 'site-page', url: 'https://api.hubapi.com/cms/v3/pages/site-pages' },
  {
    type: 'landing-page',
    url: 'https://api.hubapi.com/cms/v3/pages/landing-pages'
  },
  { type: 'blog-post', url: 'https://api.hubapi.com/cms/v3/blogs/posts' }
]

export async function GET (req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from('hubspot_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .single()

  if (!tokenRow || tokenError) {
    return NextResponse.json({ error: 'No token found' }, { status: 404 })
  }

  try {
    const allPages = await Promise.all(
      pageTypes.map(async ({ type, url }) => {
        const res = await fetch(`${url}?archived=false`, {
          headers: {
            Authorization: `Bearer ${tokenRow.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await res.json()

        if (!res.ok) {
          throw {
            type,
            status: res.status,
            message: data.message || 'Unknown error'
          }
        }

        const published = (data.results || []).filter((page: any) => {
          return (
            page.currentState === 'PUBLISHED' ||
            page.state === 'PUBLISHED' ||
            page.published ||
            page.publishDate
          )
        })

        return published.map(p => ({ ...p, _sourceType: type }))
      })
    )

    const mergedPages = allPages.flat()
    return NextResponse.json({ pages: mergedPages })
  } catch (error: any) {
    console.error('❌ HubSpot fetch error:', error)

    const isUnauthorized = error?.status === 401

    return NextResponse.json(
      {
        error: isUnauthorized
          ? 'Authorization failed. Your HubSpot token is invalid or expired.'
          : error?.message || 'Unknown error',
        message: isUnauthorized
          ? 'Authorization failed. Your HubSpot token is invalid or expired.'
          : error?.message || 'Unknown error'
      },
      { status: error?.status || 500 }
    )
  }
}
