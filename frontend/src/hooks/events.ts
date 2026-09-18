import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, EventInput } from "@/src/api";

export function useEvents(matchId: string | null) {
  return useQuery({
    queryKey: ["events", matchId],
    queryFn: () => api.getEvents(matchId as string),
    enabled: !!matchId,
  });
}

export function useAddEvent(matchId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EventInput) => api.addEvent(matchId as string, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", matchId] });
    },
  });
}
