import { confidenceLabel, confidencePercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ConfidenceIndicator({
  confidence,
  className,
}: {
  confidence: number | null | undefined;
  className?: string;
}) {
  const bucket = confidenceLabel(confidence);
  const pct = confidencePercent(confidence);
  const tone =
    bucket === "Alta"
      ? "text-success"
      : bucket === "Média"
        ? "text-warning"
        : bucket === "Baixa"
          ? "text-muted-fg"
          : "text-muted-fg";

  return (
    <div className={cn("text-xs leading-tight", className)}>
      <span className={cn("font-semibold", tone)}>{bucket}</span>
      {pct !== "—" && (
        <span className="ml-1 font-mono text-[10px] text-muted-fg tabular-nums">
          ({pct})
        </span>
      )}
    </div>
  );
}
