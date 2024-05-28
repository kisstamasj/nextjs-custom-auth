"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth";
import { DEFAULT_LOGOUT_REDIRECT } from "@/lib/routes-rules";
import { Loader, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

function Profile() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const logoutHandler = async () => {
    startTransition(async () => {
      await signOutAction();
      router.push(DEFAULT_LOGOUT_REDIRECT);
    });
  };
  return (
    <div>
      <Button onClick={logoutHandler} disabled={isPending}>
        {isPending ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Logout
      </Button>
    </div>
  );
}

export default Profile;
