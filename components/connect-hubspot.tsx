'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ConnectHubSpotButton() {
  const [token, setToken] = useState('')
  const [initialToken, setInitialToken] = useState('')
  const [submitted, setSubmitted] = useState(false)
  console.log(submitted);
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

    if (res.ok) {
      toast.success(' Token saved successfully!')
      setInitialToken(token)
      setSubmitted(true)
    } else {
      toast.error('Failed to save token. Please try again.')
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

    </div>
  )
}
