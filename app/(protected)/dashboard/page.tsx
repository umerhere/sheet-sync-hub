'use client'

import { GoogleConnectButton } from '@/components/GoogleButtons/LoginButton';
import ConnectHubSpotButton from '@/components/connect-hubspot';
import HubspotGSheetConnector from '@/components/hubspot-gsheet-connector';
import { useUser } from "@/context/UserContext";

export default function HomePage() {

  const { user } = useUser();
  console.log("user in dashboard", user); // client log
  return (
    <div className="flex flex-col">
      <h1>Welcome, {user && user.full_name}</h1>
      {/* <LoginButton /><br /> */}
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
