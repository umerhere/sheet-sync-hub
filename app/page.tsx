import Dashboard from "./(protected)/dashboard/page";
import ProtectedLayout from "./(protected)/layout";

export default function Home() {
  
  return (
    <>
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
    </>
  );
}
