import {
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.25;
const ZOOM_STEP = 0.15;

export function OriginalDocumentViewer({
  fileUrl,
  openFileHref,
  className,
  /** Altura mínima da área de leitura */
  minHeightClass = "min-h-[min(78vh,920px)]",
}: {
  fileUrl: string;
  openFileHref?: string;
  className?: string;
  minHeightClass?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(640);
  const [pages, setPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) setContainerW(Math.max(280, w - 24));
  }, []);

  useEffect(() => {
    measure();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const pageWidth = Math.round(containerW * zoom);

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
        <span className="mr-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-fg sm:inline">
          Documento
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Diminuir zoom"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[3.25rem] text-center text-xs font-mono tabular-nums text-muted-fg">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Aumentar zoom"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => setZoom(1)}
            aria-label="Redefinir zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        {pages != null && pages > 0 && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4.5rem] text-center text-xs font-medium tabular-nums">
              {page} / {pages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="secondary" size="sm" className="h-9" asChild>
            <a href={openHref} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Abrir arquivo
            </a>
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="flex min-h-0 flex-1 flex-col overflow-auto bg-muted/40 dark:bg-[hsl(222_40%_8%)]"
      >
        {err && (
          <p className="p-4 text-sm text-danger">{err}</p>
        )}
        <div className="flex flex-1 justify-center p-3 sm:p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={(d) => {
              setPages(d.numPages);
              setPage(1);
              setErr(null);
            }}
            onLoadError={(e) => setErr(String(e.message))}
            loading={
              <div className="flex flex-col items-center gap-2 py-20 text-muted-fg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Carregando PDF…</p>
              </div>
            }
          >
            <Page
              pageNumber={page}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-2xl"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
