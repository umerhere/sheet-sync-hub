'use client';

import { GoogleConnectButton } from '@/components/GoogleButtons/LoginButton';
import ConnectHubSpotButton from '@/components/connect-hubspot';
import HubspotGSheetConnector from '@/components/hubspot-gsheet-connector';
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-muted/50 px-6 py-10 dark:bg-background">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome {user && user.full_name ? user.full_name : ''} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let’s get your integrations connected and synced.
          </p>
        </div>

        {/* Google Sheets Integration */}
        <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background border border-green-200 dark:border-green-900 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-green-800 dark:text-green-300">
              📄 Connect Google Sheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleConnectButton />
          </CardContent>
        </Card>

        {/* HubSpot Integration */}
        <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background border border-orange-200 dark:border-orange-900 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-orange-800 dark:text-orange-300">
              🧩 Connect HubSpot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectHubSpotButton />
          </CardContent>
        </Card>

        {/* HubSpot + Sheets Connector */}
        <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-sky-50 to-white dark:from-sky-950 dark:to-background border border-sky-200 dark:border-sky-900 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-sky-800 dark:text-sky-300">
              ⚙️ Sync HubSpot Pages to Sheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HubspotGSheetConnector />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
