import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchAnalysisReview,
  regenerateTechnicalOpinion,
} from "@/services/analyses.service";

export function usePatchAnalysisReview(analysisId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review_status: string) =>
      patchAnalysisReview(analysisId, review_status),
    onSuccess: (data) => {
      qc.setQueryData(["analysis", analysisId], data);
    },
  });
}

export function useRegenerateParecer(analysisId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateTechnicalOpinion(analysisId),
    onSuccess: (data) => {
      qc.setQueryData(["analysis", analysisId], data);
    },
  });
}
