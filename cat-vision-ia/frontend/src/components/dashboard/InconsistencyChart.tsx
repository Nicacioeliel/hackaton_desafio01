import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InconsistencyChart({
  items,
}: {
  items: { field: string; count: number }[];
}) {
  const data = items.map((i) => ({
    name: i.field.replace(/_/g, " "),
    count: i.count,
  }));

  return (
    <Card className="h-[320px]">
      <CardHeader>
        <CardTitle>Inconsistências mais frequentes</CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-fg">
            Sem divergências registradas no histórico.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(217 91% 45%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
