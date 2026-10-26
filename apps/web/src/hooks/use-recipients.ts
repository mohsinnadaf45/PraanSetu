"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Recipient } from "@/lib/api-client";

export function useRecipients(params?: { page?: number; page_size?: number; organ?: string; status?: string }) {
  return useQuery({
    queryKey: ["recipients", params],
    queryFn: () => api.recipients.list(params),
  });
}

export function useRecipient(code: string) {
  return useQuery({
    queryKey: ["recipient", code],
    queryFn: () => api.recipients.get(code),
    enabled: Boolean(code),
  });
}

export function useCreateRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Recipient>) => api.recipients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
    },
  });
}
