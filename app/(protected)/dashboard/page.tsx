import /* LoginButton, */ LoginButton, { GoogleConnectButton } from '@/components/GoogleButtons/LoginButton';
import { createClient } from '../../../lib/supabase/server'
import LogoutButton from '@/components/GoogleButtons/LogoutButton';
import GetAllSheets from '@/components/ActionButtons/GetAllSheetsButton';
import GetAllSheetsButton from '@/components/get-all-sheets';
import ConnectHubSpotButton from '@/components/connect-hubspot';
import GetHubspotPages from '@/components/get-hubspot-pages';

export default async function HomePage() {
  const supabase = await createClient(); // call the function
  const { data: notes, error } = await supabase.from('sync_sessions').select();

  if (error) return <div>Error: {error.message}</div>

 
  return (
    <div className="flex flex-col">
      <h1>Records</h1>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
      <LoginButton /><br />
      <GoogleConnectButton /><br />
      <ConnectHubSpotButton /><br />
      <GetHubspotPages /><br />
      {/* <GetAllSheets /><br /> */}
      <GetAllSheetsButton/><br />
      <LogoutButton /><br />

    </div>
  )
}
