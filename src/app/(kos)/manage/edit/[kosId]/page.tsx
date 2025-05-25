"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import KosEditPage from "@/components/pages/manage/KosEditPage";
import { defaultQueryClientOptions } from "@/libs/tanstack-query/options";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default function KosEdit() {
  const queryClient = new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <KosEditPage />
      <Footer />
    </HydrationBoundary>
  );
}
