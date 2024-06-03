import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/h1";
import { getProfile } from "@/lib/auth/auth";
import Link from "next/link";
import React from "react";

async function About() {
  const profile = await getProfile();
  return (
    <div>
      <H1>About</H1>
      {JSON.stringify(profile)}
      <div>
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default About;
