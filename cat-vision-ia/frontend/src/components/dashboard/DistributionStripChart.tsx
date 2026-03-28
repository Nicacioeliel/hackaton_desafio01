import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DistributionStripChart({
  title,
  rows,
  formatLabel,
}: {
  title: string;
  rows: { key: string; count: number }[];
  formatLabel: (key: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <Card className="h-[320px]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-fg">
            Sem dados agregados ainda.
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.key}>
              <div className="mb-1 flex justify-between gap-2 text-xs">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {formatLabel(r.key)}
                </span>
                <span className="shrink-0 font-mono tabular-nums text-muted-fg">
                  {r.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/80 transition-[width] duration-300"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
