"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useOffers(params?: { page?: number; page_size?: number; status?: string }) {
  return useQuery({
    queryKey: ["offers", params],
    queryFn: () => api.offers.list(params),
    refetchInterval: 15000, // Periodic refresh for real-time countdowns
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: () => api.offers.get(id),
    enabled: Boolean(id),
  });
}

export function useRespondOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response, reason }: { id: string; response: "accepted" | "declined"; reason?: string }) =>
      api.offers.respond(id, { response, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
