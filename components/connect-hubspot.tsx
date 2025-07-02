'use client'

import { useEffect, useState } from 'react'

export default function ConnectHubSpotButton() {
  const [token, setToken] = useState('')
  const [initialToken, setInitialToken] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch('/api/hubspot/token', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        setToken(data.token)
        setInitialToken(data.token) // Store the original for comparison
        setSubmitted(true)
      }
    }

    fetchToken()
  }, [])

  const handleSaveToken = async () => {
    const res = await fetch('/api/hubspot/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()
    console.log('umar saving token', data)

    if (res.ok) {
      setInitialToken(token) // ✅ Reset initial to new value
      setSubmitted(true)
    } else {
      alert('❌ Failed to save token: ' + data.error)
    }
  }

  const hasChanged = token && token !== initialToken

  return (
    <div className='space-y-4 '>
      <h2 className='text-lg font-semibold'>🔌 Connect HubSpot</h2>

      <input
        type='password'
        placeholder='Enter your HubSpot private app token'
        value={token}
        onChange={e => setToken(e.target.value)}
        className='w-full p-2 border rounded'
      />

      <button
        onClick={handleSaveToken}
        disabled={!hasChanged}
        className='px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50'
      >
        Save Token
      </button>

      {submitted && (
        <p className='text-green-600'>
          ✅ Token saved! Ready to fetch HubSpot pages.
        </p>
      )}
    </div>
  )
}
