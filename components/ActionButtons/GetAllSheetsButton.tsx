'use client'

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    // redirect_uri: 'http://localhost:3000/api/google/callback',
    redirect_uri: `${window.location.origin}/api/google/callback`,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ].join(' ')
  }).toString()

export function GoogleConnectButton() {
  return (
    <button
      onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
    >
      Connect Google Sheets
    </button>
  )
}
