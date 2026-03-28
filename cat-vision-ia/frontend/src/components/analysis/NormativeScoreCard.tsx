import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { NormativeBreakdown } from "@/types/analysis";
import { NormativeStatusBadge } from "@/components/analysis/NormativeStatusBadge";
import { cn } from "@/lib/utils";

export function NormativeScoreCard({
  score,
  status,
  breakdown,
  className,
}: {
  score: number | null | undefined;
  status: string | null | undefined;
  breakdown: NormativeBreakdown | null | undefined;
  className?: string;
}) {
  const pct = score != null ? Math.min(100, Math.max(0, score)) : 0;
  return (
    <Card className={cn("border-border/80 bg-card/90", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Scale className="h-5 w-5 text-primary" />
          Conformidade normativa
          <NormativeStatusBadge status={status} className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score != null ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-3xl font-bold tabular-nums">{score.toFixed(1)}%</span>
              <span className="text-sm text-muted-fg">
                Conforme a Resolução 1.137 do CONFEA (referência parametrizada)
              </span>
            </div>
            <Progress value={pct} />
          </>
        ) : (
          <p className="text-sm text-muted-fg">
            Índice normativo não disponível para esta análise (processada antes da
            atualização do motor).
          </p>
        )}
        {breakdown && (
          <ul className="space-y-1.5 border-l-2 border-primary/30 pl-3 text-xs text-muted-fg">
            <li>
              Obrigatórias atendidas:{" "}
              <span className="font-mono font-medium text-foreground">
                {breakdown.obligatory_met}/{breakdown.obligatory_total}
              </span>
            </li>
            <li>
              Violações:{" "}
              <span className="text-danger font-medium">
                {breakdown.violations_critical}
              </span>{" "}
              críticas ·{" "}
              <span className="text-warning font-medium">
                {breakdown.violations_medium}
              </span>{" "}
              médias ·{" "}
              <span className="font-medium text-muted-fg">
                {breakdown.violations_low}
              </span>{" "}
              leves
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
