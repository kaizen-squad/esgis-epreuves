const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
};

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Taille lisible d'un fichier : "614 o", "345,2 Ko", "1,6 Mo". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${number.format(bytes / 1024)} Ko`;
  return `${number.format(bytes / (1024 * 1024))} Mo`;
}

/** Type d'un fichier d'apres son type MIME : "application/pdf" devient "PDF", "image/png" "PNG". */
export function formatFileType(mimeType: string): string {
  const [essence = ""] = mimeType.split(";");
  const type = essence.trim().toLowerCase();
  return (
    FILE_TYPE_LABELS[type] ?? (type.split("/")[1]?.toUpperCase() || "Fichier")
  );
}
