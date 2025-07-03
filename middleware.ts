import { updateSession } from '@/lib/supabase/middleware'

export const middleware = updateSession

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
