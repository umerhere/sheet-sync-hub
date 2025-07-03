import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST (req: NextRequest) {
  const supabase = await createClient()
  const { token } = await req.json()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { error } = await supabase.from('hubspot_tokens').upsert(
    {
      user_email: user.email,
      access_token: token,
      created_at: new Date().toISOString()
    },
    { onConflict: 'user_email' } // 👈 this is the key part
  )

  if (error) {
    return NextResponse.json(
      { error: 'Upsert failed', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function GET () {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('hubspot_tokens')
    .select('access_token')
    .eq('user_email', user.email)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Token not found', details: error.message },
      { status: 404 }
    )
  }

  return NextResponse.json({ token: data.access_token })
}
