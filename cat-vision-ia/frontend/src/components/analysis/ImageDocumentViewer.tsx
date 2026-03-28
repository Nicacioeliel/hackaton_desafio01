import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.15;

export function ImageDocumentViewer({
  fileUrl,
  openFileHref,
  className,
  minHeightClass = "min-h-[min(78vh,920px)]",
}: {
  fileUrl: string;
  openFileHref?: string;
  className?: string;
  minHeightClass?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const openHref = openFileHref ?? fileUrl;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft",
        minHeightClass,
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2.5 backdrop-blur-sm">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-muted-fg">
          Imagem
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-xs font-mono tabular-nums text-muted-fg">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => setZoom(1)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button variant="secondary" size="sm" className="h-9" asChild>
            <a href={openHref} target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/40 p-4 dark:bg-[hsl(222_40%_8%)]">
        <div
          className="flex items-start justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <img
            src={fileUrl}
            alt="Documento enviado"
            className="max-w-none rounded-lg shadow-2xl ring-1 ring-border/60"
            style={{ maxHeight: "min(85vh, 1200px)" }}
          />
        </div>
      </div>
    </div>
  );
}
