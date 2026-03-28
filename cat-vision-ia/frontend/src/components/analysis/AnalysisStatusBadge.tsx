import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";

export function AnalysisStatusBadge({ status }: { status: string }) {
  const v =
    status === "VERDE"
      ? "success"
      : status === "AMARELO"
        ? "warning"
        : status === "VERMELHO"
          ? "danger"
          : "outline";
  return <Badge variant={v}>{statusLabel(status)}</Badge>;
}
