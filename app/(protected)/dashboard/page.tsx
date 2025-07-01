import /* LoginButton, */ LoginButton, { GoogleConnectButton } from '@/components/GoogleButtons/LoginButton';
import LogoutButton from '@/components/GoogleButtons/LogoutButton';
import GetAllSheetsButton from '@/components/get-all-sheets';
import ConnectHubSpotButton from '@/components/connect-hubspot';
import GetHubspotPages from '@/components/get-hubspot-pages';
import HubspotGSheetConnector from '@/components/hubspot-gsheet-connector';

export default async function HomePage() {

  return (
    <div className="flex flex-col">
      <LoginButton /><br />
      <GoogleConnectButton /><br />
      <ConnectHubSpotButton /><br />
      <HubspotGSheetConnector /><br />
      {/* <GetHubspotPages /><br /> */}
      {/* <GetAllSheets /><br /> */}
      {/* <GetAllSheetsButton/><br /> */}
      <LogoutButton /><br />

    </div>
  )
}
