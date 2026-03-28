import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  VERDE: "hsl(152 69% 36%)",
  AMARELO: "hsl(38 92% 45%)",
  VERMELHO: "hsl(0 72% 51%)",
};

export function AnalysisStatusChart({
  verde,
  amarelo,
  vermelho,
}: {
  verde: number;
  amarelo: number;
  vermelho: number;
}) {
  const data = [
    { name: "Compatível", value: verde, key: "VERDE" as const },
    { name: "Atenção", value: amarelo, key: "AMARELO" as const },
    { name: "Divergência", value: vermelho, key: "VERMELHO" as const },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card className="h-[320px]">
        <CardHeader>
          <CardTitle>Distribuição por semáforo</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-fg">
          Nenhuma análise ainda — rode uma nova triagem para popular o gráfico.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[320px]">
      <CardHeader>
        <CardTitle>Distribuição por semáforo</CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [v, "Análises"]}
              contentStyle={{ borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
