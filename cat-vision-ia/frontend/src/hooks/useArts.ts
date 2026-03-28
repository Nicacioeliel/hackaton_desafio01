import { useQuery } from "@tanstack/react-query";
import { fetchArts } from "@/services/arts.service";

export function useArts(q: string) {
  return useQuery({
    queryKey: ["arts", q],
    queryFn: () => fetchArts(q || undefined),
  });
}
