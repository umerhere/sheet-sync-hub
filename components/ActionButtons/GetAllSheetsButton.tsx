'use client'

export function GoogleConnectButton() {
  const handleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')
      alert('Google Client ID not set')
      return
    }

    const redirectUri = `${window.location.origin}/api/google/callback`

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' ')
      }).toString()

    window.location.href = authUrl
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
    >
      Connect Google Sheets
    </button>
  )
}
