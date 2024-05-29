"use client";

import { AuthSchemaType, authSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { UAParser } from "ua-parser-js";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes-rules";
import { signInWithCredentials } from "@/lib/auth";

export default function AuthCard() {
  const router = useRouter();
  const form = useForm<AuthSchemaType>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isPending, startTransition] = useTransition();

  const ua = new UAParser();

  const onSubmit = async (data: AuthSchemaType) => {
    startTransition(async () => {
      await signInWithCredentials(data, JSON.stringify(ua.getResult()));

      router.push(DEFAULT_LOGIN_REDIRECT);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="asd@asd.hu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
