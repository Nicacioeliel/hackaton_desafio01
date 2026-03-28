import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreBreakdown } from "@/types/analysis";

export function ScoreExplanationCard({
  breakdown,
  score,
  className,
}: {
  breakdown: ScoreBreakdown | null | undefined;
  score: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Info className="h-4 w-4 text-primary" />
          Como o score foi formado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs leading-relaxed text-muted-fg">
        <p className="font-medium text-foreground">
          Índice exibido:{" "}
          <span className="font-mono tabular-nums">{score.toFixed(1)}</span>
          /100
        </p>
        {breakdown?.lines?.length ? (
          <ul className="space-y-2 border-l-2 border-primary/25 pl-3">
            {breakdown.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>
            O detalhamento explicável será exibido após processamento com a versão
            atual do motor de validação. Use &quot;Gerar parecer técnico&quot; para
            recalcular a partir dos campos salvos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
