"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Donor } from "@/lib/api-client";

export function useDonors(params?: { page?: number; page_size?: number; organ?: string; status?: string }) {
  return useQuery({
    queryKey: ["donors", params],
    queryFn: () => api.donors.list(params),
  });
}

export function useDonor(code: string) {
  return useQuery({
    queryKey: ["donor", code],
    queryFn: () => api.donors.get(code),
    enabled: Boolean(code),
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donor>) => api.donors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}
