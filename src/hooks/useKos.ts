import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Kos,
  fetchKosList,
  addKos,
  updateKos,
  deleteKos,
} from "@/services/kosService";

interface Filters {
  search?: string;
  sortBy?: string | number;
  sortOrder?: "asc" | "desc";
}

interface AddKosPayload {
  ownerId: string;
  name: string;
  address: string;
  description: string;
  maxCapacity: number;
  price: number;
}

interface UpdateKosPayload {
  id: string;
  data: Omit<Kos, "id">;
}

export const useKos = (filters?: Filters) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET: kos
  const {
    data: kos = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Kos[]>({
    queryKey: ["kos", filters],
    queryFn: () => fetchKosList(`${token}`),
  });

  // POST: Add Kos
  const createMutation = useMutation({
    mutationFn: (newKos: AddKosPayload) => addKos(newKos, `Bearer ${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kos"] });
    },
  });

  // PUT: Update Kos
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateKosPayload) =>
      updateKos(id, data, `Bearer ${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kos"] });
    },
  });

  // DELETE: Delete Product
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKos(id, `Bearer ${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kos"] });
    },
  });

  return {
    kos,
    isLoading,
    error,
    refetch,

    addKos: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateKos: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteKos: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
};
