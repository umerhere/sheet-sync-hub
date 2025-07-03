import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { languageMap } from './languageMap'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getLanguageFullName (code: string): string {
  if (!code) return 'Unknown'

  const normalized = code.toLowerCase().replace('_', '-')

  return (
    languageMap[normalized] || languageMap[normalized.split('-')[0]] || code
  )
}

export function formatReadableDate (isoDate: string): string {
  if (!isoDate) return 'Unknown'

  const date = new Date(isoDate)

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function getContentTypesSummary (pages: { content?: string }[]): string {
  const types = Array.from(new Set(pages.map(p => p.content).filter(Boolean)))
  return types.join(', ')
}

const isLocalhost =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
