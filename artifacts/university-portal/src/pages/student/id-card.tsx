import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";
import { AUBarcode } from "@/components/document-assets";

export function IdCardPage() {
  const { data, isLoading, isError } = useGetStudentDashboard();
  const branding = useBranding();

  if (isLoading) return (
    <div className="p-8">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-56 w-[540px] mx-auto" />
    </div>
  );

  if (isError || !data) return (
    <div className="p-8 text-center text-destructive">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <p>Failed to load ID card data.</p>
    </div>
  );

  const { student } = data;
  const s = student as typeof student & {
    universityRegNo?: string;
    bloodGroup?: string;
    aadhaarNo?: string;
    sgpa?: number;
    attendancePct?: number;
    category?: string;
  };

  const enrollNum = s.enrollmentNo || "AU2021CS001";
  const logoSrc = branding.logo_round ?? "/au-logo-round.png";
  const registrarSig = branding.signature_registrar ?? "/signature-registrar.webp";

  const handleDownload = () => {
    const style = document.createElement("style");
    style.innerHTML = `@media print { .no-print { display: none !important; } body { margin: 0; } .print-page { break-after: page; } }`;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-500 mt-1 text-sm">Alliance University — Official Identity Card</p>
        </div>
        <Button onClick={handleDownload} className="bg-[#8b0000] hover:bg-[#6b0000]">
          <Download className="w-4 h-4 mr-2" />Download / Print
        </Button>
      </div>

      {/* ── FRONT ── */}
      <div className="space-y-1 print-page">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider no-print">Front Side</p>
        <div
          id="id-card-front"
          className="relative overflow-hidden shadow-2xl"
          style={{ width: 540, height: 340, borderRadius: 10, fontFamily: "Arial, sans-serif" }}
        >
          {/* Campus background */}
          <img
            src="/id-card-bg-front.jpg"
            alt="Campus"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.12)" }} />

          {/* Top: Horizontal logo */}
          <div className="absolute top-3 left-3" style={{ maxWidth: 260 }}>
            <img
              src="/au-logo-horizontal.png"
              alt="Alliance University"
              className="object-contain drop-shadow-lg"
              style={{ height: 44, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.7))" }}
            />
            <p className="text-white mt-0.5" style={{ fontSize: 7, lineHeight: 1.3, opacity: 0.85, textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>
              Alliance College of Engineering and Design
            </p>
          </div>

          {/* Top-right: Student photo */}
          <div
            className="absolute top-3 right-3 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden"
            style={{ width: 82, height: 100, background: "#1565c0" }}
          >
            {s.photoUrl ? (
              <img src={s.photoUrl} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-xs text-center font-semibold px-1">
                <svg className="w-10 h-10 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                Photo
              </div>
            )}
          </div>

          {/* Blood group badge */}
          {s.bloodGroup && (
            <div className="absolute" style={{ top: 108, right: 8 }}>
              <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                {s.bloodGroup}
              </div>
            </div>
          )}

          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(6,12,38,0.91)" }}>
            <div className="px-3 pt-2.5 pb-0.5">
              <p className="font-black text-white tracking-wider" style={{ fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                {s.name?.toUpperCase()}
              </p>
              <p className="font-semibold mt-0.5" style={{ fontSize: 12, color: "#e0e0e0" }}>
                Program : {s.program} {s.academicYear?.split("-")[0]}
              </p>
            </div>

            <div className="flex items-end justify-between px-3 pb-1.5 pt-1.5">
              <div>
                <AUBarcode value={enrollNum} height={32} textSize={8} barColor="#ffffff" showText={true} />
              </div>
              <div className="text-right">
                <img
                  src={registrarSig}
                  alt="Signature"
                  className="h-9 ml-auto mb-0.5"
                  style={{ maxWidth: 120, filter: "invert(1) brightness(0.9)" }}
                />
                <p className="font-semibold" style={{ fontSize: 10, color: "#d0d0d0" }}>Registrar</p>
              </div>
            </div>

            <div className="text-center pb-2 flex items-center justify-between px-3">
              <p className="font-bold" style={{ color: "#e53935", fontSize: 13 }}>www.alliance.edu.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BACK ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider no-print">Back Side</p>
        <div
          id="id-card-back"
          className="relative overflow-hidden shadow-2xl"
          style={{ width: 540, height: 340, borderRadius: 10, fontFamily: "Arial, sans-serif" }}
        >
          {/* Aerial campus background */}
          <img
            src="/id-card-bg-back.jpg"
            alt="Campus Aerial"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay on left for text readability */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.1) 100%)" }} />

          {/* Address text overlay */}
          <div className="absolute top-5 left-5 text-white" style={{ maxWidth: 270 }}>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, fontWeight: 400, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              Chikkahagade Cross, Chandapura - Anekal<br />
              Main Road, Anekal, Bengaluru - 562 106,<br />
              Karnataka, India.
            </p>
            <div className="mt-3" style={{ fontSize: 11, lineHeight: 1.7, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              <p>Phone: +91 80 4619 9000 / 9100 /</p>
              <p>+91804129 9200</p>
              <p>Fax: +91 80 46199099</p>
              <p>E-mail: enquiry@alliance.edu.in</p>
            </div>
          </div>

          {/* Student name on back (optional) */}
          <div className="absolute bottom-0 left-0 right-0 text-center py-2" style={{ background: "rgba(0,0,0,0.55)" }}>
            <p className="font-bold" style={{ color: "#e53935", fontSize: 14 }}>www.alliance.edu.in</p>
          </div>

          {/* Lost & found note on back */}
          <div className="absolute bottom-10 left-4 right-4">
            <p className="text-white text-center" style={{ fontSize: 9, opacity: 0.75, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
              If found, please return to Alliance University. This card is non-transferable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
