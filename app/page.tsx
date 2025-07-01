import ProtectedPage from "./(protected)/page";
import Dashboard from "./(protected)/dashboard/page";
import ProtectedLayout from "./(protected)/layout";

export default function Home() {
  
  return (
    <>
    <ProtectedLayout>
      <h1>Home Component</h1>
      <Dashboard />
      <ProtectedPage />
    </ProtectedLayout>
    </>
  );
}
