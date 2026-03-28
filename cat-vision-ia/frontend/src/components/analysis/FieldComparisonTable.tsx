import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabel } from "@/lib/format";
import type { FieldResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

function fieldBadgeVariant(status: string) {
  if (status === "COMPATIVEL") return "success";
  if (status === "AUSENTE" || status === "NAO_VERIFICADO") return "warning";
  if (status === "DIVERGENTE") return "danger";
  return "outline";
}

export function FieldComparisonTable({ fields }: { fields: FieldResult[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Comparação campo a campo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
              <tr className="text-left text-muted-fg">
                <th className="px-4 py-3 font-medium">Campo</th>
                <th className="px-3 py-3 font-medium">ART</th>
                <th className="px-3 py-3 font-medium">ACT (extraído)</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <Fragment key={f.id}>
                  <tr
                    className={cn(
                      "border-t border-border/80 align-top",
                      f.status === "DIVERGENTE" && "bg-danger/5",
                      f.status === "AUSENTE" && "bg-warning/5",
                    )}
                  >
                    <td className="px-4 py-3 font-medium capitalize">
                      {f.field_name.replace(/_/g, " ")}
                    </td>
                    <td className="max-w-[200px] px-3 py-3 text-muted-fg break-words">
                      {f.art_value ?? "—"}
                    </td>
                    <td className="max-w-[220px] px-3 py-3 break-words">
                      {f.extracted_value ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={fieldBadgeVariant(f.status)}>
                        {statusLabel(f.status)}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        aria-expanded={!!open[f.id]}
                        onClick={() =>
                          setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))
                        }
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition",
                            open[f.id] && "rotate-180",
                          )}
                        />
                      </Button>
                    </td>
                  </tr>
                  {open[f.id] && (
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="px-4 pb-4 pt-0 text-xs text-muted-fg">
                        <p className="font-mono text-[11px] text-foreground/80">
                          Normalizado ART: {f.normalized_art_value || "—"}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-foreground/80">
                          Normalizado ACT: {f.normalized_extracted_value || "—"}
                        </p>
                        <p className="mt-2">{f.justification}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
