import { Gavel, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NormativeImpactBadge } from "@/components/analysis/NormativeImpactBadge";
import { criticalityLabel, normativeRuleStatusLabel } from "@/lib/format";
import type { NormativeRuleRow } from "@/types/analysis";
import { cn } from "@/lib/utils";

type FilterMode = "todos" | "criticas" | "obrigatorias";

function statusBadgeVariant(s: string) {
  if (s === "ATENDIDA") return "success";
  if (s === "NAO_ATENDIDA") return "danger";
  return "warning";
}

export function NormativeRulesTable({
  rules,
  className,
}: {
  rules: NormativeRuleRow[];
  className?: string;
}) {
  const [filter, setFilter] = useState<FilterMode>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rules.filter((r) => {
      if (filter === "criticas" && r.severidade?.toUpperCase() !== "CRITICA") {
        return false;
      }
      if (
        filter === "obrigatorias" &&
        r.obrigatoriedade?.toUpperCase() !== "OBRIGATORIO"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.nome.toLowerCase().includes(q) ||
        r.rule_id.toLowerCase().includes(q) ||
        (r.campo_relacionado || "").toLowerCase().includes(q) ||
        r.resolucao.toLowerCase().includes(q)
      );
    });
  }, [rules, filter, query]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft",
        "min-h-[min(56vh,720px)]",
        className,
      )}
    >
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Gavel className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Regras normativas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["todos", "Todas"],
                ["criticas", "Apenas críticas"],
                ["obrigatorias", "Apenas obrigatórias"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                className="h-9"
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <Input
              className="h-10 pl-9"
              placeholder="Buscar regra, campo ou resolução…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-fg">
          {filtered.length} de {rules.length} regra(s) exibida(s)
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-md">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-muted-fg">
              <th className="px-3 py-3 w-[18%]">Regra</th>
              <th className="px-3 py-3 w-[11%]">Resolução</th>
              <th className="px-3 py-3 w-[12%]">Artigo / ref.</th>
              <th className="px-3 py-3 w-[9%]">Campo</th>
              <th className="px-3 py-3 w-[10%]">Status</th>
              <th className="px-3 py-3 w-[9%]">Severidade</th>
              <th className="px-3 py-3 w-[21%]">Justificativa</th>
              <th className="px-3 py-3 w-[10%]">Impacto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-fg">
                  Nenhuma regra com os filtros atuais.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.rule_id}
                  className={cn(
                    "border-b border-border/70 align-top hover:bg-muted/20",
                    r.status === "NAO_ATENDIDA" && "bg-danger/[0.04]",
                    r.status === "ATENCAO" && "bg-warning/[0.04]",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium leading-snug text-foreground">{r.nome}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-fg">
                      {r.rule_id}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {r.obrigatoriedade}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-fg">
                    {r.resolucao}
                    {r.resolucao_versao ? ` (${r.resolucao_versao})` : ""}
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-snug">{r.artigo}</td>
                  <td className="px-3 py-2.5 text-xs capitalize text-muted-fg">
                    {(r.campo_relacionado || "—").replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={statusBadgeVariant(r.status)} className="text-[10px]">
                      {normativeRuleStatusLabel(r.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {criticalityLabel(r.severidade)}
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-snug text-muted-fg">
                    {r.justificativa}
                  </td>
                  <td className="px-3 py-2.5">
                    <NormativeImpactBadge impact={r.impacto_regulatorio} />
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
