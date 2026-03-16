"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useMe } from "@/services/queries";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.replace("/login");
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}