import { Badge } from "@/components/ui/badge";
import { criticalityLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CriticalityBadge({
  criticality,
  className,
}: {
  criticality: string | null | undefined;
  className?: string;
}) {
  const u = (criticality || "").toUpperCase();
  const variant =
    u === "CRITICA" || u === "CRÍTICA"
      ? "danger"
      : u === "MEDIA" || u === "MÉDIA"
        ? "warning"
        : u === "BAIXA"
          ? "outline"
          : "outline";
  const label = criticalityLabel(criticality);
  if (label === "—")
    return (
      <span className={cn("text-xs text-muted-fg", className)} title="Sem criticidade">
        —
      </span>
    );
  return (
    <Badge variant={variant} className={cn("whitespace-nowrap text-[10px]", className)}>
      {label}
    </Badge>
  );
}
