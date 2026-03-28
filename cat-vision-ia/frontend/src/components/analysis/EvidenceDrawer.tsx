import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { criticalityLabel, statusLabel } from "@/lib/format";
import type { FieldResult } from "@/types/analysis";

export function EvidenceDrawer({
  field,
  open,
  onClose,
}: {
  field: FieldResult | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        aria-label="Fechar painel de evidência"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="evidence-drawer-title"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <FileText className="h-4 w-4 text-primary" />
            Evidência e decisão
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
          {field ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                  Campo
                </p>
                <p className="font-medium capitalize text-foreground">
                  {field.field_name.replace(/_/g, " ")}
                </p>
              </div>
              <div className="grid gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-fg">
                    Valor ART (referência)
                  </p>
                  <p className="mt-0.5 break-words font-mono text-xs">
                    {field.art_value ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-fg">
                    ACT extraído
                  </p>
                  <p className="mt-0.5 break-words font-mono text-xs">
                    {field.extracted_value ?? "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-fg">
                  Status
                </p>
                <p className="mt-0.5">{statusLabel(field.status)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-fg">
                  Criticidade
                </p>
                <p className="mt-0.5">{criticalityLabel(field.criticality)}</p>
              </div>
              {(field.evidence_page != null || field.evidence_excerpt) && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-fg">
                    Evidência no documento
                  </p>
                  {field.evidence_page != null && (
                    <p className="mt-0.5 text-xs">
                      Página provável:{" "}
                      <span className="font-mono">{field.evidence_page}</span>
                    </p>
                  )}
                  {field.evidence_excerpt && (
                    <blockquote className="mt-2 rounded-md border border-border/60 bg-background/80 p-3 text-xs leading-relaxed text-foreground/90">
                      {field.evidence_excerpt}
                    </blockquote>
                  )}
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-fg">
                  Justificativa da validação
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-fg">
                  {field.justification ?? "—"}
                </p>
              </div>
              {field.category && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-fg">
                    Categoria
                  </p>
                  <p className="mt-0.5 capitalize">{field.category}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-fg">Nenhum campo selecionado.</p>
          )}
        </div>
      </aside>
    </>
  );
}
