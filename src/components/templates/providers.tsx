"use client";

import TanstackQueryProviders from "@/libs/tanstack-query/providers";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TanstackQueryProviders>{children}</TanstackQueryProviders>;
}
