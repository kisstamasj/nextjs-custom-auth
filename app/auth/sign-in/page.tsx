import AuthCard from "@/components/auth/auth-card";
import { H1 } from "@/components/ui/h1";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-5">
     <H1>Auth test</H1>
     <AuthCard />
    </main>
  );
}
