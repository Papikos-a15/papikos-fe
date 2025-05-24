"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AddKosPage from "@/components/pages/manage/AddKosPage";
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
      <AddKosPage />
      <Footer />
    </HydrationBoundary>
  );
}
