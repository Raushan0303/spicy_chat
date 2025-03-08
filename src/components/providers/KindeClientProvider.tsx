"use client";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export function KindeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KindeProvider>{children}</KindeProvider>;
}
