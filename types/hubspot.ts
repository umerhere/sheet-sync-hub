export interface HubspotPageT {
  id: string
  name?: string
  slug?: string
  url?: string
  language?: string
  updated?: string
  updatedAt?: string
  authorName?: string
  publishDate?: string
  published?: boolean
  currentState?: string
  state?: string
  //   @typescript-eslint/no-explicit-any
  [key: string]: any // for any extra HubSpot-specific fields
}
