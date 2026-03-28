import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "doc", label: "Documento recebido" },
  { id: "art", label: "ART vinculada" },
  { id: "val", label: "Validação executada" },
  { id: "rev", label: "Revisão do analista" },
  { id: "out", label: "Exportação / parecer" },
] as const;

export type AnalysisStepperMode =
  | { kind: "nova-analise"; uploadReady: boolean; artReady: boolean; processing: boolean }
  | { kind: "resultado"; reviewStatus: string | null | undefined };

function stepStates(mode: AnalysisStepperMode): ("done" | "current" | "pending")[] {
  const out: ("done" | "current" | "pending")[] = [
    "pending",
    "pending",
    "pending",
    "pending",
    "pending",
  ];

  if (mode.kind === "nova-analise") {
    const { uploadReady, artReady, processing } = mode;
    if (!uploadReady) {
      out[0] = "current";
      return out;
    }
    out[0] = "done";
    if (!artReady) {
      out[1] = "current";
      return out;
    }
    out[1] = "done";
    if (processing) {
      out[2] = "current";
      return out;
    }
    out[2] = "current";
    return out;
  }

  out[0] = "done";
  out[1] = "done";
  out[2] = "done";
  const rev = (mode.reviewStatus || "PENDENTE").toUpperCase();
  if (rev === "PENDENTE") {
    out[3] = "current";
    out[4] = "pending";
  } else {
    out[3] = "done";
    out[4] = "current";
  }
  return out;
}

export function AnalysisStepper({
  mode,
  className,
}: {
  mode: AnalysisStepperMode;
  className?: string;
}) {
  const states = stepStates(mode);

  return (
    <nav
      aria-label="Fluxo da análise documental"
      className={cn(
        "rounded-xl border border-border/70 bg-muted/20 px-3 py-4 backdrop-blur-sm dark:bg-muted/10",
        className,
      )}
    >
      <ol className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-0 lg:divide-x lg:divide-border/60">
        {STEPS.map((s, i) => {
          const st = states[i];
          const isLast = i === STEPS.length - 1;
          return (
            <li
              key={s.id}
              className={cn(
                "flex min-w-0 flex-1 items-start gap-2.5 lg:px-4 lg:first:pl-2 lg:last:pr-2",
                !isLast && "lg:border-border/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  st === "done" &&
                    "border-success/50 bg-success/15 text-success",
                  st === "current" &&
                    "border-primary/60 bg-primary/15 text-primary shadow-sm ring-2 ring-primary/20",
                  st === "pending" &&
                    "border-border bg-card/50 text-muted-fg",
                )}
                aria-current={st === "current" ? "step" : undefined}
              >
                {st === "done" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : st === "current" ? (
                  <Circle className="h-3.5 w-3.5 fill-current" aria-hidden />
                ) : (
                  <span className="tabular-nums">{i + 1}</span>
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight sm:text-[13px]",
                    st === "current" && "text-foreground",
                    st === "pending" && "text-muted-fg",
                    st === "done" && "text-foreground/90",
                  )}
                >
                  {s.label}
                </p>
                {st === "current" && (
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-primary/90">
                    Etapa atual
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
