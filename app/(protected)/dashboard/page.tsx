import /* LoginButton, */ LoginButton, { GoogleConnectButton } from '@/components/GoogleButtons/LoginButton';
import ConnectHubSpotButton from '@/components/connect-hubspot';
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
      {/* <LogoutButton /><br /> */}

    </div>
  )
}
