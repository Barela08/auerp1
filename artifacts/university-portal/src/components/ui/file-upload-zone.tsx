import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import {
  Upload, FileText, X, CheckCircle, XCircle, Loader2, RefreshCw
} from "lucide-react";

interface FileUploadZoneProps {
  accept?: string;
  currentUrl?: string | null;
  currentContentType?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  disabled?: boolean;
  maxSizeMB?: number;
  compact?: boolean;
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function isImage(type: string) {
  return IMAGE_TYPES.includes(type);
}

export function FileUploadZone({
  accept = "image/png,image/jpeg,image/webp,application/pdf",
  currentUrl,
  currentContentType,
  onUpload,
  onDelete,
  disabled = false,
  maxSizeMB = 10,
  compact = false,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setStatus("error");
      setErrorMsg(`File too large. Max size: ${maxSizeMB}MB`);
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    const allowedTypes = accept.split(",").map((s) => s.trim());
    if (!allowedTypes.some((t) => file.type === t || file.type.startsWith(t.replace("/*", "")))) {
      setStatus("error");
      setErrorMsg("File type not supported");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    if (isImage(file.type)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewType(file.type);
      setPreviewName(file.name);
    } else {
      setPreviewUrl(null);
      setPreviewType(file.type);
      setPreviewName(file.name);
    }

    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const tick = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 12 : p));
    }, 120);

    try {
      await onUpload(file);
      clearInterval(tick);
      setProgress(100);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
        setPreviewUrl(null);
        setPreviewName(null);
        setPreviewType(null);
      }, 2500);
    } catch (err: unknown) {
      clearInterval(tick);
      setStatus("error");
      setProgress(0);
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(null);
      setPreviewName(null);
      setPreviewType(null);
      setTimeout(() => setStatus("idle"), 3500);
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [accept, maxSizeMB, onUpload]);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setStatus("uploading");
    try {
      await onDelete();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setErrorMsg("Delete failed");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const hasCurrentFile = !!currentUrl;
  const isImageCurrent = currentContentType ? isImage(currentContentType) : false;

  return (
    <div className="w-full">
      {/* Current file preview */}
      {hasCurrentFile && status === "idle" && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
          {isImageCurrent ? (
            <div className="relative">
              <img
                src={`${currentUrl}?t=${Math.floor(Date.now() / 5000)}`}
                alt="Current upload"
                className={compact ? "w-full max-h-28 object-contain p-2" : "w-full max-h-48 object-contain p-3"}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">PDF Uploaded</p>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View / Download
                  </a>
                </div>
              </div>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && status === "idle" && inputRef.current?.click()}
        className={[
          "relative border-2 border-dashed rounded-lg transition-all cursor-pointer select-none",
          compact ? "p-4" : "p-6",
          dragging
            ? "border-blue-500 bg-blue-50"
            : status === "success"
              ? "border-green-400 bg-green-50"
              : status === "error"
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40",
          (disabled || status === "uploading") ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onChange}
          disabled={disabled || status === "uploading"}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {status === "uploading" ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-blue-700">Uploading…</p>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-blue-100 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-500">{progress}%</p>
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-500" />
              <p className="text-sm font-semibold text-green-700">Uploaded Successfully!</p>
              {(previewUrl || previewName) && (
                <p className="text-xs text-green-600 truncate max-w-[200px]">{previewName}</p>
              )}
            </>
          ) : status === "error" ? (
            <>
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Upload Failed</p>
              <p className="text-xs text-red-500">{errorMsg}</p>
            </>
          ) : (
            <>
              {hasCurrentFile ? (
                <RefreshCw className={`${compact ? "w-6 h-6" : "w-8 h-8"} text-blue-400`} />
              ) : (
                <Upload className={`${compact ? "w-6 h-6" : "w-8 h-8"} text-gray-400`} />
              )}
              <div>
                <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-700`}>
                  {dragging ? "Drop file here" : hasCurrentFile ? "Replace file" : "Click or drag & drop to upload"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {accept.includes("application/pdf") ? "JPG, PNG, WEBP, PDF" : "JPG, PNG, WEBP"} — max {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
