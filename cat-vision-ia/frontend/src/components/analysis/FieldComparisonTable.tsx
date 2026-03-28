import { ChevronDown, ChevronRight, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CriticalityBadge } from "@/components/analysis/CriticalityBadge";
import { ConfidenceIndicator } from "@/components/analysis/ConfidenceIndicator";
import { statusLabel } from "@/lib/format";
import type { FieldResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

function fieldBadgeVariant(status: string) {
  if (status === "COMPATIVEL") return "success";
  if (status === "AUSENTE") return "warning";
  if (status === "NAO_IDENTIFICADO") return "warning";
  if (status === "NAO_VERIFICADO") return "outline";
  if (status === "DIVERGENTE") return "danger";
  return "outline";
}

type StatusFilter =
  | "todos"
  | "DIVERGENTE"
  | "AUSENTE"
  | "NAO_IDENTIFICADO"
  | "NAO_VERIFICADO"
  | "COMPATIVEL";

function matchesFilter(f: FieldResult, filter: StatusFilter): boolean {
  if (filter === "todos") return true;
  return f.status === filter;
}

function fieldLabel(name: string) {
  return name.replace(/_/g, " ");
}

function criticalityRank(c: string | null | undefined): number {
  const u = (c || "").toUpperCase();
  if (u === "CRITICA" || u === "CRÍTICA") return 4;
  if (u === "MEDIA" || u === "MÉDIA") return 3;
  if (u === "BAIXA") return 2;
  if (u === "NENHUMA") return 0;
  return 1;
}

export function FieldComparisonTable({
  fields,
  className,
  density = "comfortable",
  onOpenEvidence,
}: {
  fields: FieldResult[];
  className?: string;
  density?: "comfortable" | "compact";
  onOpenEvidence?: (field: FieldResult) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("todos");
  const [query, setQuery] = useState("");
  const [sortCrit, setSortCrit] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = fields.filter((f) => {
      if (!matchesFilter(f, filter)) return false;
      if (!q) return true;
      const label = fieldLabel(f.field_name).toLowerCase();
      return (
        label.includes(q) ||
        f.field_name.toLowerCase().includes(q) ||
        (f.category || "").toLowerCase().includes(q)
      );
    });
    if (sortCrit) {
      rows = [...rows].sort((a, b) => {
        const dr = criticalityRank(b.criticality) - criticalityRank(a.criticality);
        if (dr !== 0) return dr;
        return fieldLabel(a.field_name).localeCompare(fieldLabel(b.field_name), "pt-BR");
      });
    }
    return rows;
  }, [fields, filter, query, sortCrit]);

  const pad = density === "compact" ? "px-2 py-2" : "px-3 py-2.5";
  const thPad = density === "compact" ? "px-2 py-2" : "px-3 py-2.5";
  const minH =
    density === "compact"
      ? "min-h-[min(55vh,560px)]"
      : "min-h-[min(72vh,880px)]";

  const filterButtons: { key: StatusFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "DIVERGENTE", label: "Divergentes" },
    { key: "AUSENTE", label: "Ausentes" },
    { key: "NAO_IDENTIFICADO", label: "Não identif. (OCR)" },
    { key: "NAO_VERIFICADO", label: "Não verificados" },
    { key: "COMPATIVEL", label: "Compatíveis" },
  ];

  function toggleExpand(id: number) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft",
        minH,
        className,
      )}
    >
      <div className="border-b border-border bg-muted/30 px-3 py-3 backdrop-blur-sm sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filterButtons.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                className="h-8 rounded-lg text-xs sm:h-9 sm:text-sm"
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant={sortCrit ? "secondary" : "outline"}
              size="sm"
              className="h-9 shrink-0 text-xs"
              onClick={() => setSortCrit((s) => !s)}
            >
              {sortCrit ? "Ordenado por criticidade" : "Ordem original"}
            </Button>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
              <Input
                className="h-9 pl-9 sm:h-10"
                placeholder="Buscar campo ou categoria…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar campo"
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-fg">
          Exibindo{" "}
          <span className="font-mono font-medium text-foreground">
            {filtered.length}
          </span>{" "}
          de {fields.length} campos · Triagem explicável e rastreável.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-b-xl [scrollbar-gutter:stable]">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-sm">
          <thead className="sticky top-0 z-20 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-fg sm:text-xs">
              <th className={cn(thPad, "w-[3%]")} aria-label="Expandir" />
              <th className={cn(thPad, "w-[12%]")}>Campo</th>
              <th className={cn(thPad, "w-[14%]")}>ART</th>
              <th className={cn(thPad, "w-[14%]")}>ACT extraído</th>
              <th className={cn(thPad, "w-[10%]")}>Status</th>
              <th className={cn(thPad, "w-[9%]")}>Criticidade</th>
              <th className={cn(thPad, "w-[9%]")}>Confiança</th>
              <th className={cn(thPad, "w-[20%]")}>Justificativa</th>
              <th className={cn(thPad, "w-[9%]")}>Evidência</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-muted-fg"
                >
                  Nenhum campo corresponde aos filtros.
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const isOpen = !!expanded[f.id];
                return (
                  <tr
                    key={f.id}
                    className={cn(
                      "border-b border-border/70 align-top transition-colors hover:bg-muted/25",
                      f.status === "DIVERGENTE" && "bg-danger/[0.06]",
                      (f.status === "AUSENTE" ||
                        f.status === "NAO_IDENTIFICADO") &&
                        "bg-warning/[0.05]",
                    )}
                  >
                    <td className={cn(pad, "align-middle")}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleExpand(f.id)}
                        aria-expanded={isOpen}
                        aria-label={
                          isOpen ? "Recolher justificativa" : "Expandir justificativa"
                        }
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className={cn(pad, "font-medium capitalize")}>
                      <span
                        className="line-clamp-2"
                        title={fieldLabel(f.field_name)}
                      >
                        {fieldLabel(f.field_name)}
                      </span>
                      {f.category && (
                        <p className="mt-0.5 text-[10px] font-normal capitalize text-muted-fg">
                          {f.category}
                        </p>
                      )}
                    </td>
                    <td
                      className={cn(
                        pad,
                        "text-muted-fg",
                        "break-words text-xs leading-snug",
                      )}
                      title={f.art_value ?? undefined}
                    >
                      {f.art_value ?? "—"}
                    </td>
                    <td
                      className={cn(
                        pad,
                        "break-words text-xs leading-snug text-foreground/90",
                      )}
                      title={f.extracted_value ?? undefined}
                    >
                      {f.extracted_value ?? "—"}
                    </td>
                    <td className={pad}>
                      <Badge
                        variant={fieldBadgeVariant(f.status)}
                        className="whitespace-normal text-[10px] leading-tight"
                      >
                        {statusLabel(f.status)}
                      </Badge>
                    </td>
                    <td className={pad}>
                      <CriticalityBadge criticality={f.criticality} />
                    </td>
                    <td className={pad}>
                      <ConfidenceIndicator confidence={f.confidence} />
                    </td>
                    <td className={cn(pad, "text-xs leading-snug text-muted-fg")}>
                      <p
                        className={cn(
                          !isOpen && "line-clamp-2",
                          isOpen && "max-h-40 overflow-y-auto pr-1",
                        )}
                        title={f.justification ?? undefined}
                      >
                        {f.justification ?? "—"}
                      </p>
                      {(f.normalized_art_value || f.normalized_extracted_value) && (
                        <p className="mt-1 font-mono text-[10px] leading-tight text-foreground/45">
                          n·ART {f.normalized_art_value || "—"} · n·ACT{" "}
                          {f.normalized_extracted_value || "—"}
                        </p>
                      )}
                    </td>
                    <td className={cn(pad, "align-middle")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-[10px]"
                        onClick={() => onOpenEvidence?.(f)}
                        disabled={!onOpenEvidence}
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
