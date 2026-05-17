import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";

function Barcode({ value }: { value: string }) {
  const bars: boolean[] = [];
  for (let i = 0; i < 80; i++) {
    const ch = value.charCodeAt(i % value.length);
    bars.push((ch + i * 7 + i) % 3 !== 0);
  }
  return (
    <div className="flex items-end gap-px">
      {bars.map((wide, i) => (
        <div
          key={i}
          style={{
            width: wide ? 3 : 1.5,
            height: i % 5 === 0 ? 32 : 24,
            background: "#000",
          }}
        />
      ))}
    </div>
  );
}

export function IdCardPage() {
  const { data, isLoading, isError } = useGetStudentDashboard();
  const branding = useBranding();

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-56 w-[540px] mx-auto" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-destructive">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Failed to load ID card data.</p>
      </div>
    );
  }

  const { student } = data;
  const s = student as typeof student & {
    universityRegNo?: string;
    bloodGroup?: string;
    aadhaarNo?: string;
    sgpa?: number;
    attendancePct?: number;
  };

  const enrollNum = s.enrollmentNo || "13010332022";
  const logoSrc = branding.logo_round ?? "/au-logo-main.png";
  const registrarSig = branding.signature_registrar;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-500 mt-1 text-sm">Digital identity card — Alliance University</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="no-print">
          <Printer className="w-4 h-4 mr-2" />Print ID Card
        </Button>
      </div>

      {/* ── FRONT SIDE ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Front</p>
        <div
          id="id-card-front"
          className="relative overflow-hidden shadow-2xl"
          style={{ width: 540, height: 340, borderRadius: 8, fontFamily: "Arial, sans-serif" }}
        >
          <img
            src={branding.student_login_bg ?? "/campus-bg1.jpg"}
            alt="Campus"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* Top-left: AU logo + text */}
          <div className="absolute top-4 left-4 flex items-start gap-2">
            <img src={logoSrc} alt="AU" className="w-12 h-12 object-contain drop-shadow-lg" />
            <div className="drop-shadow-lg">
              <p className="font-black leading-tight" style={{ fontSize: 18, color: "#8b0000", fontFamily: "Georgia, serif" }}>ALLIANCE</p>
              <p className="font-black leading-tight" style={{ fontSize: 15, color: "#1a237e", fontFamily: "Georgia, serif" }}>UNIVERSITY</p>
              <p className="text-gray-700" style={{ fontSize: 8, lineHeight: 1.2, maxWidth: 160 }}>
                Private University established in Karnataka State by Act No.34 of year 2010<br />
                Recognized by the University Grants Commission (UGC), New Delhi
              </p>
              <p className="font-semibold text-gray-800 mt-0.5" style={{ fontSize: 9 }}>
                Alliance College of Engineering and Design
              </p>
            </div>
          </div>

          {/* Top-right: Student Photo placeholder */}
          <div
            className="absolute top-4 right-4 border-2 border-white shadow-lg flex items-center justify-center"
            style={{ width: 80, height: 95, background: "#1565c0" }}
          >
            <div className="text-white text-xs text-center font-semibold px-1">
              <svg className="w-10 h-10 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
              Photo
            </div>
          </div>

          {/* Blood group badge */}
          {s.bloodGroup && (
            <div className="absolute top-4" style={{ right: 100 }}>
              <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                {s.bloodGroup}
              </div>
            </div>
          )}

          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(10,20,50,0.88)" }}>
            <div className="px-4 pt-2.5 pb-1">
              <p className="font-black text-white tracking-wide" style={{ fontSize: 18 }}>
                {s.name?.toUpperCase()}
              </p>
              <p className="text-gray-300 font-semibold" style={{ fontSize: 11 }}>
                {s.program} · {s.department}
              </p>
              {s.universityRegNo && (
                <p className="text-gray-400" style={{ fontSize: 9 }}>
                  Univ. Regn. No.: {s.universityRegNo}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between px-4 pb-2">
              <div>
                <Barcode value={enrollNum} />
                <p className="text-gray-400 text-center mt-0.5" style={{ fontSize: 9 }}>{enrollNum}</p>
              </div>
              <div className="text-right">
                {registrarSig ? (
                  <img src={registrarSig} alt="Signature" className="h-8 ml-auto" style={{ maxWidth: 120, filter: "invert(1)" }} />
                ) : (
                  <div className="h-8 border-b border-gray-400 w-24 ml-auto" />
                )}
                <p className="text-gray-300 font-semibold" style={{ fontSize: 10 }}>Registrar</p>
              </div>
            </div>

            <div className="text-center pb-1.5">
              <p className="font-bold" style={{ color: "#e53935", fontSize: 13 }}>www.alliance.edu.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BACK SIDE ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Back</p>
        <div
          id="id-card-back"
          className="relative overflow-hidden shadow-2xl"
          style={{ width: 540, height: 340, borderRadius: 8, fontFamily: "Arial, sans-serif" }}
        >
          <img
            src="/campus-aerial.jpg"
            alt="Campus Aerial"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white text-xs">
            <div className="bg-black/60 p-3 rounded text-[11px] leading-relaxed">
              <p className="font-bold text-sm mb-1">Alliance University</p>
              <p>Chikkahagade Cross, Chandapura - Anekal Main Road,</p>
              <p>Anekal, Bengaluru - 562 106, Karnataka, India.</p>
              <p className="mt-1">Phone: +91 80 4619 9000 / 9100 / +91 80 4129 9200</p>
              <p>Fax: +91 80 46199099</p>
              <p>E-mail: enquiry@alliance.edu.in</p>
              <p className="mt-1 font-bold text-green-400">www.alliance.edu.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
