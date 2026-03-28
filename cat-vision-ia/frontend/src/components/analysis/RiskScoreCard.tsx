import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RiskScoreCard({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Score de risco documental
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-4xl font-bold tabular-nums">{score.toFixed(1)}</span>
          <span className="text-sm text-muted-fg">de 100</span>
        </div>
        <Progress value={pct} />
        <p className="text-xs text-muted-fg leading-relaxed">
          Quanto maior, mais evidências de divergência, ausência de dados ou alertas
          de metadados. Não substitui julgamento profissional do analista.
        </p>
      </CardContent>
    </Card>
  );
}
