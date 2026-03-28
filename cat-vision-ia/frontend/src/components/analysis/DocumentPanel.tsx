import { ImageDocumentViewer } from "./ImageDocumentViewer";
import { OriginalDocumentViewer } from "./OriginalDocumentViewer";

export function DocumentPanel({
  fileUrl,
  mimeType,
  openFileHref,
  minHeightClass,
  className,
}: {
  fileUrl: string;
  mimeType?: string | null;
  openFileHref?: string;
  minHeightClass?: string;
  className?: string;
}) {
  const isPdf =
    (mimeType || "").includes("pdf") ||
    fileUrl.toLowerCase().includes(".pdf");
  if (isPdf) {
    return (
      <OriginalDocumentViewer
        fileUrl={fileUrl}
        openFileHref={openFileHref}
        minHeightClass={minHeightClass}
        className={className}
      />
    );
  }
  return (
    <ImageDocumentViewer
      fileUrl={fileUrl}
      openFileHref={openFileHref}
      minHeightClass={minHeightClass}
      className={className}
    />
  );
}
