import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusLabel } from "@/lib/format";
import type { FieldResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

function fieldBadgeVariant(status: string) {
  if (status === "COMPATIVEL") return "success";
  if (status === "AUSENTE" || status === "NAO_VERIFICADO") return "warning";
  if (status === "DIVERGENTE") return "danger";
  return "outline";
}

type StatusFilter = "todos" | "DIVERGENTE" | "AUSENTE" | "COMPATIVEL";

function matchesFilter(f: FieldResult, filter: StatusFilter): boolean {
  if (filter === "todos") return true;
  if (filter === "COMPATIVEL") return f.status === "COMPATIVEL";
  if (filter === "DIVERGENTE") return f.status === "DIVERGENTE";
  if (filter === "AUSENTE")
    return f.status === "AUSENTE" || f.status === "NAO_VERIFICADO";
  return true;
}

function fieldLabel(name: string) {
  return name.replace(/_/g, " ");
}

export function FieldComparisonTable({
  fields,
  className,
  density = "comfortable",
}: {
  fields: FieldResult[];
  className?: string;
  /** `compact` reduz padding na visão dividida */
  density?: "comfortable" | "compact";
}) {
  const [filter, setFilter] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fields.filter((f) => {
      if (!matchesFilter(f, filter)) return false;
      if (!q) return true;
      const label = fieldLabel(f.field_name).toLowerCase();
      return label.includes(q) || f.field_name.toLowerCase().includes(q);
    });
  }, [fields, filter, query]);

  const pad = density === "compact" ? "px-3 py-2" : "px-4 py-3.5";
  const thPad = density === "compact" ? "px-3 py-2.5" : "px-4 py-3.5";
  const minH =
    density === "compact"
      ? "min-h-[min(55vh,560px)]"
      : "min-h-[min(72vh,880px)]";

  const filterButtons: { key: StatusFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "DIVERGENTE", label: "Divergentes" },
    { key: "AUSENTE", label: "Ausentes" },
    { key: "COMPATIVEL", label: "Compatíveis" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft",
        minH,
        className,
      )}
    >
      <div className="border-b border-border bg-muted/30 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                className="h-9 rounded-lg"
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <Input
              className="h-10 pl-9"
              placeholder="Buscar por campo…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar campo"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-fg">
          Exibindo{" "}
          <span className="font-mono font-medium text-foreground">
            {filtered.length}
          </span>{" "}
          de {fields.length} campos
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-b-xl [scrollbar-gutter:stable]">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <thead className="sticky top-0 z-20 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-fg">
              <th className={cn(thPad, "w-[14%]")}>Campo</th>
              <th className={cn(thPad, "w-[22%]")}>Valor ART</th>
              <th className={cn(thPad, "w-[22%]")}>Valor ACT</th>
              <th className={cn(thPad, "w-[12%]")}>Status</th>
              <th className={cn(thPad, "w-[30%]")}>Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-muted-fg"
                >
                  Nenhum campo corresponde aos filtros.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr
                  key={f.id}
                  className={cn(
                    "border-b border-border/70 align-top transition-colors hover:bg-muted/25",
                    f.status === "DIVERGENTE" && "bg-danger/[0.06]",
                    (f.status === "AUSENTE" || f.status === "NAO_VERIFICADO") &&
                      "bg-warning/[0.06]",
                  )}
                >
                  <td className={cn(pad, "font-medium capitalize text-foreground")}>
                    <span className="line-clamp-2" title={fieldLabel(f.field_name)}>
                      {fieldLabel(f.field_name)}
                    </span>
                  </td>
                  <td
                    className={cn(
                      pad,
                      "text-muted-fg",
                      "whitespace-nowrap overflow-hidden text-ellipsis",
                    )}
                    title={f.art_value ?? undefined}
                  >
                    {f.art_value ?? "—"}
                  </td>
                  <td
                    className={cn(
                      pad,
                      "text-foreground/90",
                      "whitespace-nowrap overflow-hidden text-ellipsis",
                    )}
                    title={f.extracted_value ?? undefined}
                  >
                    {f.extracted_value ?? "—"}
                  </td>
                  <td className={pad}>
                    <Badge
                      variant={fieldBadgeVariant(f.status)}
                      className="whitespace-nowrap"
                    >
                      {statusLabel(f.status)}
                    </Badge>
                  </td>
                  <td className={cn(pad, "text-xs leading-snug text-muted-fg")}>
                    <p className="line-clamp-3" title={f.justification ?? undefined}>
                      {f.justification ?? "—"}
                    </p>
                    {(f.normalized_art_value || f.normalized_extracted_value) && (
                      <p className="mt-1.5 font-mono text-[10px] leading-tight text-foreground/50 line-clamp-2">
                        n·ART: {f.normalized_art_value || "—"} · n·ACT:{" "}
                        {f.normalized_extracted_value || "—"}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
