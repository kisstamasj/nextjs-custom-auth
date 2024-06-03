"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader, LogOut } from "lucide-react";
import Link from "next/link";

function Profile() {
  const { isLoading: isPending, signOut, refresh } = useAuth();

  const logoutHandler = async () => {
    signOut();
  };

  return (
    <div className="flex flex-row gap-2">
      <Button onClick={logoutHandler} disabled={isPending}>
        {isPending ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Logout
      </Button>
      <Button asChild>
        <Link href="/dashboard/about"> About</Link>
      </Button>
      <Button onClick={refresh}>Refresh session</Button>
    </div>
  );
}

export default Profile;
