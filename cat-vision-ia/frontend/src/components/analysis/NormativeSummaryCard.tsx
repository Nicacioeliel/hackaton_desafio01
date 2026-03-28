import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NormativeBreakdown } from "@/types/analysis";
import { cn } from "@/lib/utils";

export function NormativeSummaryCard({
  breakdown,
  className,
}: {
  breakdown: NormativeBreakdown | null | undefined;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/80 bg-card/80", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BookMarked className="h-4 w-4 text-primary" />
          Resumo regulatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs leading-relaxed text-muted-fg">
        <p className="text-foreground/90">
          A validação normativa automatizada apoia o analista com base em regras
          parametrizadas (p.ex. Resolução 1.137/2023).{" "}
          <strong className="text-foreground">Não substitui</strong> o juízo técnico
          nem a interpretação oficial do CREA-MA.
        </p>
        {breakdown?.lines?.length ? (
          <ul className="list-disc space-y-1 pl-4">
            {breakdown.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
