"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/shared/layout/ThemeProvider";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useState } from "react";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="top-right"
      theme={(resolvedTheme as "light" | "dark") ?? "dark"}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          // audit_performance F-06: 10-minute garbage collection so React
          // Query frees memory it no longer needs after the user navigates
          // away.
          gcTime: 10 * 60 * 1000,
          retry: 1,
          // audit_performance F-06: a quick alt-tab should not fire a re-fetch
          // storm against the API. Individual queries that legitimately need
          // it (pipeline, CV-parse polling) opt in explicitly.
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <ThemedToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
