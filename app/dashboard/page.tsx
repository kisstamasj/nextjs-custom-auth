"use client";
import { useAuth } from "@/lib/auth/auth-context";
import Profile from "./_components/profile";

function Dashboard() {
  const { profile } = useAuth();

  return (
    <div>
      {JSON.stringify(profile)}
      <Profile />
    </div>
  );
}

export default Dashboard;
