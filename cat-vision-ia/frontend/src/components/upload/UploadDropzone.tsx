import { FileUp } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  onFile,
  disabled,
}: {
  onFile: (f: File) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition",
        drag ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-muted/20",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        type="file"
        accept=".pdf,image/*"
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileUp className="h-7 w-7" />
      </div>
      <p className="mt-4 font-semibold">Arraste o PDF ou imagem do ACT</p>
      <p className="mt-1 text-sm text-muted-fg">
        ou clique para selecionar · PDF, JPG, PNG
      </p>
    </div>
  );
}
