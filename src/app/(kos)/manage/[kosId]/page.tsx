"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import KosDetailPage from "@/components/pages/manage/KosDetailPage";
import { defaultQueryClientOptions } from "@/libs/tanstack-query/options";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default function Add() {
  const queryClient = new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <KosDetailPage />
      <Footer />
    </HydrationBoundary>
  );
}
