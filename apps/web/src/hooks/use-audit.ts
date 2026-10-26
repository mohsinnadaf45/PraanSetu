"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAuditLogs(params?: { page?: number; page_size?: number; action?: string; actor_code?: string }) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn: () => api.audit.list(params),
  });
}

export function useVerifyAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.audit.verify(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
