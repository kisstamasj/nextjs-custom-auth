import { getProfile } from "@/lib/auth";
import Profile from "./_components/profile";

export const revalidate = 0;

async function Dashboard() {
  const profile = await getProfile();

  return (
    <div>
      {JSON.stringify(profile)}
      <Profile />
    </div>
  );
}

export default Dashboard;
