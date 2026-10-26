"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useMatches(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["matches", page, pageSize],
    queryFn: () => api.matches.list(page, pageSize),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: () => api.matches.get(id),
    enabled: Boolean(id),
  });
}

export function useRunMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (donor_code: string) => api.matches.run(donor_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
