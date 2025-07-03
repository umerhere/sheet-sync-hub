import { createClient } from '../../lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient(); // call the function
  const { data: notes, error } = await supabase.from('sync_sessions').select();

  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Records</h1>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  )
}
