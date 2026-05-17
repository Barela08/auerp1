import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";

interface BrandingItem {
  key: string;
  label: string;
  description: string;
  accept: string;
  defaultSrc?: string;
}

const BRANDING_ITEMS: BrandingItem[] = [
  {
    key: "logo_round",
    label: "Round Logo (Seal)",
    description: "Used in login pages and the sidebar. Best as a square PNG with transparent background.",
    accept: "image/png,image/jpeg,image/webp",
    defaultSrc: "/au-logo-main.png",
  },
  {
    key: "logo_horizontal",
    label: "Horizontal Logo",
    description: "Landscape logo with text. Displayed in headers and printed documents.",
    accept: "image/png,image/jpeg,image/webp",
    defaultSrc: "/au-logo-text.png",
  },
  {
    key: "student_login_bg",
    label: "Student Login Background",
    description: "Full-page background image for the student login screen.",
    accept: "image/jpeg,image/png,image/webp",
    defaultSrc: "/campus-bg1.jpg",
  },
  {
    key: "staff_login_bg",
    label: "Staff/Faculty Login Background",
    description: "Full-page background image for the staff login screen.",
    accept: "image/jpeg,image/png,image/webp",
    defaultSrc: "/campus-bg2.jpg",
  },
  {
    key: "admin_login_bg",
    label: "Admin Login Background",
    description: "Full-page background image for the admin login screen.",
    accept: "image/jpeg,image/png,image/webp",
    defaultSrc: "/campus-bg2.jpg",
  },
  {
    key: "signature_controller",
    label: "Controller of Examinations Signature",
    description: "Signature image used on hall tickets and results documents.",
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    key: "signature_registrar",
    label: "Registrar Signature",
    description: "Signature image used on ID cards and official letters.",
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    key: "signature_exam",
    label: "Examination Branch Signature",
    description: "Used on exam forms and hall tickets.",
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    key: "hall_ticket_header",
    label: "Hall Ticket Header Image",
    description: "Banner shown at the top of hall tickets.",
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    key: "receipt_header",
    label: "Fee Receipt Header Image",
    description: "Banner shown at the top of fee receipts.",
    accept: "image/png,image/jpeg,image/webp",
  },
];

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function BrandingCard({ item }: { item: BrandingItem }) {
  const branding = useBranding();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const currentUrl = branding[item.key as keyof typeof branding] as string | null;
  const displaySrc = currentUrl ?? item.defaultSrc ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const data = await toBase64(file);
      const res = await fetch(`/api/branding/image/${item.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data, contentType: file.type }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setTimeout(() => setStatus("idle"), 3000);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!currentUrl) return;
    setStatus("uploading");
    try {
      await fetch(`/api/branding/image/${item.key}`, {
        method: "DELETE",
        credentials: "include",
      });
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
      setErrorMsg("Delete failed");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex gap-5 items-start">
      {/* Preview */}
      <div className="shrink-0 w-24 h-24 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
        {displaySrc ? (
          <img
            src={`${displaySrc}?t=${Date.now()}`}
            alt={item.label}
            className="max-w-full max-h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="text-gray-300 text-xs text-center px-1">No image set</span>
        )}
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
          </div>
          {currentUrl && (
            <button
              onClick={handleDelete}
              disabled={status === "uploading"}
              className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Reset to default"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept={item.accept}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={status === "uploading"}
            className="flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
            style={{ background: "#1a6fc4" }}
          >
            {status === "uploading" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="w-3.5 h-3.5" /> Upload</>
            )}
          </button>

          {status === "success" && (
            <span className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-red-600 text-xs">
              <XCircle className="w-3.5 h-3.5" /> {errorMsg}
            </span>
          )}

          {currentUrl && status === "idle" && (
            <span className="text-green-600 text-xs font-medium">● Custom</span>
          )}
          {!currentUrl && item.defaultSrc && status === "idle" && (
            <span className="text-gray-400 text-xs">Using default</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminBrandingPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branding &amp; Customization</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload custom logos, backgrounds, and signatures. Changes take effect immediately across all pages.
        </p>
      </div>

      <div className="space-y-3">
        <div className="pb-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Logos</h2>
        </div>
        {BRANDING_ITEMS.slice(0, 2).map((item) => (
          <BrandingCard key={item.key} item={item} />
        ))}

        <div className="pb-1 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Login Page Backgrounds</h2>
        </div>
        {BRANDING_ITEMS.slice(2, 5).map((item) => (
          <BrandingCard key={item.key} item={item} />
        ))}

        <div className="pb-1 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Signatures &amp; Document Headers</h2>
        </div>
        {BRANDING_ITEMS.slice(5).map((item) => (
          <BrandingCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}
