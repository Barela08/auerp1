import { useQueryClient } from "@tanstack/react-query";
import { useBranding } from "@/contexts/branding-context";
import { FileUploadZone } from "@/components/ui/file-upload-zone";

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

  const currentUrl = branding[item.key as keyof typeof branding] as string | null;

  const handleUpload = async (file: File) => {
    const data = await toBase64(file);
    const res = await fetch(`/api/branding/image/${item.key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ data, contentType: file.type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "Upload failed");
    }
    queryClient.invalidateQueries({ queryKey: ["branding"] });
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/branding/image/${item.key}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed");
    queryClient.invalidateQueries({ queryKey: ["branding"] });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
        {!currentUrl && item.defaultSrc && (
          <span className="inline-block mt-1 text-xs text-gray-400">Currently using default</span>
        )}
        {currentUrl && (
          <span className="inline-block mt-1 text-xs font-medium text-green-600">● Custom image active</span>
        )}
      </div>
      <FileUploadZone
        accept={item.accept}
        currentUrl={currentUrl ?? item.defaultSrc}
        currentContentType="image/png"
        onUpload={handleUpload}
        onDelete={currentUrl ? handleDelete : undefined}
        maxSizeMB={8}
        compact
      />
    </div>
  );
}

export function AdminBrandingPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branding &amp; Customization</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload custom logos, backgrounds, and signatures. Drag &amp; drop or click to upload. Changes take effect immediately.
        </p>
      </div>

      <div className="space-y-4">
        <div className="pb-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Logos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANDING_ITEMS.slice(0, 2).map((item) => (
            <BrandingCard key={item.key} item={item} />
          ))}
        </div>

        <div className="pb-1 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Login Page Backgrounds</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANDING_ITEMS.slice(2, 5).map((item) => (
            <BrandingCard key={item.key} item={item} />
          ))}
        </div>

        <div className="pb-1 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Signatures</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANDING_ITEMS.slice(5, 8).map((item) => (
            <BrandingCard key={item.key} item={item} />
          ))}
        </div>

        <div className="pb-1 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Document Headers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANDING_ITEMS.slice(8).map((item) => (
            <BrandingCard key={item.key} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
