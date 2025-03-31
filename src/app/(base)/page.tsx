import { defaultQueryClientOptions } from "@/libs/tanstack-query/options";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import TrialsPage from "@/components/pages/trials/page";

export default async function Home() {
  const queryClient = new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrialsPage />
    </HydrationBoundary>
  );
}
