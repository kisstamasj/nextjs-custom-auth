"use client";

import { AuthSchemaType } from "@/schemas/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useTransition } from "react";
import { UAParser } from "ua-parser-js";
import { LOGIN_PAGE, REDIRECT_AFTER_LOGIN } from "../routes-rules";
import {
  Profile,
  getProfile,
  signInWithCredentials,
  signOutAction,
} from "./auth";

interface IAuthContext {
  profile: Profile | null;
  signInCredentials: (data: AuthSchemaType) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

interface IAuthProvider {
  children: React.ReactNode;
  profile: Profile | null;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children, profile }: IAuthProvider) => {
  const router = useRouter();
  const [stateProfile, setStateProfile] = useState<Profile | null>(profile);
  const [isPending, startTransition] = useTransition();
  const signInCredentials = async (data: AuthSchemaType, redirect = true) => {
    startTransition(async () => {
      const ua = new UAParser();
      const user = await signInWithCredentials(
        data,
        JSON.stringify(ua.getResult())
      );
      setStateProfile(user);
      if (redirect) router.push(REDIRECT_AFTER_LOGIN);
    });
  };

  const signOut = async () => {
    startTransition(async () => {
      await signOutAction();
      router.push(LOGIN_PAGE);
    });
  };

  const refresh = async () => {
    startTransition(async () => {
      try {
        const profile = await getProfile();
        setStateProfile(profile);
      } catch (error) {
        setStateProfile(null);
        console.error(error);
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        profile: stateProfile,
        signInCredentials: signInCredentials,
        signOut,
        refresh,
        isLoading: isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
