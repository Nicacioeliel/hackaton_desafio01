import { Badge } from "@/components/ui/badge";
import { normativeGlobalLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NormativeStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const u = (status || "").toUpperCase();
  const variant =
    u === "CONFORME"
      ? "success"
      : u === "NAO_CONFORME"
        ? "danger"
        : u === "PARCIAL"
          ? "warning"
          : "outline";
  return (
    <Badge variant={variant} className={cn("whitespace-nowrap", className)}>
      {normativeGlobalLabel(status)}
    </Badge>
  );
}
