import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createAnalysis } from "@/services/analyses.service";

export function useCreateAnalysis() {
  const qc = useQueryClient();
  const nav = useNavigate();
  return useMutation({
    mutationFn: ({
      uploadId,
      artId,
    }: {
      uploadId: number;
      artId: number;
    }) => createAnalysis(uploadId, artId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
      nav(`/analise/${data.id}`);
    },
  });
}
