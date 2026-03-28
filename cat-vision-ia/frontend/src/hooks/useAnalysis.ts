import { useQuery } from "@tanstack/react-query";
import { fetchAnalysis } from "@/services/analyses.service";

export function useAnalysis(id: number | undefined) {
  return useQuery({
    queryKey: ["analysis", id],
    queryFn: () => fetchAnalysis(id!),
    enabled: !!id,
  });
}
