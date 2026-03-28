import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function NormativeImpactBadge({
  impact,
  className,
}: {
  impact: string | null | undefined;
  className?: string;
}) {
  if (!impact?.trim()) return null;
  const strong =
    /imped|não conforme|inconsisten|diverg/i.test(impact);
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg border px-3 py-2 text-xs leading-snug",
        strong
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-border/70 bg-muted/30 text-muted-fg",
        className,
      )}
    >
      {strong ? (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span className="text-foreground/90">{impact}</span>
    </div>
  );
}
