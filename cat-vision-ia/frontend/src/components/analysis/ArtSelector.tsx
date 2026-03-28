import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useArts } from "@/hooks/useArts";
import type { Art } from "@/types/art";
import { cn } from "@/lib/utils";

export function ArtSelector({
  selected,
  onSelect,
}: {
  selected: Art | null;
  onSelect: (a: Art) => void;
}) {
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch, error } = useArts(q);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selecionar ART de referência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <Input
            className="pl-9"
            placeholder="Buscar por número, profissional, contratante…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {isLoading && <LoadingState label="Carregando ARTs…" />}
        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : "Falha ao listar ARTs"}
            onRetry={() => refetch()}
          />
        )}
        {data && (
          <ul className="max-h-[320px] space-y-2 overflow-auto pr-1">
            {data.items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left text-sm transition",
                    selected?.id === a.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">
                      {a.numero_art}
                    </span>
                    <Badge variant="outline">{a.uf ?? "—"}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted-fg">
                    {a.profissional_nome ?? "Profissional não informado"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
        {data && data.items.length === 0 && (
          <p className="text-sm text-muted-fg">Nenhuma ART encontrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
