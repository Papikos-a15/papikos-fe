"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ManageKosPage from "@/components/pages/manage/ManageKosPage";
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
      <ManageKosPage />
      <Footer />
    </HydrationBoundary>
  );
}
