import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer, Download } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";
import campusBg from "@assets/IMG-20260516-WA0001_1779005617687.jpg";

function Barcode({ value }: { value: string }) {
  const bars: boolean[] = [];
  for (let i = 0; i < 95; i++) {
    const ch = value.charCodeAt(i % value.length);
    bars.push((ch + i * 7 + i) % 3 !== 0);
  }
  return (
    <div className="flex items-end gap-px">
      {bars.map((wide, i) => (
        <div key={i} style={{ width: wide ? 3 : 1.5, height: i % 7 === 0 ? 36 : 26, background: "#000" }} />
      ))}
    </div>
  );
}

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

  const enrollNum = s.enrollmentNo || "13010332022";
  const logoSrc = branding.logo_round ?? "/au-logo-main.png";
  const registrarSig = branding.signature_registrar;

  const handleDownload = () => {
    const style = document.createElement("style");
    style.innerHTML = `@media print { .no-print { display: none !important; } body { margin: 0; } }`;
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
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="bg-[#8b0000] hover:bg-[#6b0000]">
            <Download className="w-4 h-4 mr-2" />Download / Print
          </Button>
        </div>
      </div>

      {/* FRONT */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider no-print">Front Side</p>
        <div
          id="id-card-front"
          className="relative overflow-hidden shadow-2xl"
          style={{ width: 540, height: 340, borderRadius: 10, fontFamily: "Arial, sans-serif" }}
        >
          <img
            src={campusBg}
            alt="Campus"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.18)" }} />

          {/* Top-left: Logo + University text */}
          <div className="absolute top-3 left-3 flex items-start gap-2">
            <img src={logoSrc} alt="AU" className="w-11 h-11 object-contain drop-shadow-lg" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
            <div style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              <p className="font-black leading-tight" style={{ fontSize: 17, color: "#cc0000", fontFamily: "Georgia, serif" }}>ALLIANCE</p>
              <p className="font-black leading-tight" style={{ fontSize: 14, color: "#ffffff", fontFamily: "Georgia, serif" }}>UNIVERSITY</p>
              <p className="text-white" style={{ fontSize: 7, lineHeight: 1.3, maxWidth: 170, opacity: 0.9 }}>
                Private University established in Karnataka State by Act No.34 of year 2010<br />
                Recognized by the University Grants Commission (UGC), New Delhi
              </p>
              <p className="font-semibold text-white mt-0.5" style={{ fontSize: 8, opacity: 0.9 }}>
                Alliance College of Engineering and Design
              </p>
            </div>
          </div>

          {/* Top-right: Student photo */}
          <div
            className="absolute top-3 right-3 border-2 border-white shadow-lg flex items-center justify-center"
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
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(8,16,45,0.93)" }}>
            <div className="px-3 pt-2 pb-0.5">
              <p className="font-black text-white tracking-wide" style={{ fontSize: 17 }}>
                {s.name?.toUpperCase()}
              </p>
              <p className="text-gray-300 font-semibold" style={{ fontSize: 10 }}>
                {s.program} &nbsp;·&nbsp; {s.department}
              </p>
              {s.enrollmentNo && (
                <p className="text-gray-400" style={{ fontSize: 9 }}>
                  Enroll. No.: {s.enrollmentNo}
                  {s.admissionNo ? `  |  Adm. No.: ${s.admissionNo}` : ""}
                </p>
              )}
              {s.semester && (
                <p className="text-gray-400" style={{ fontSize: 9 }}>
                  Semester: {s.semester}
                  {s.academicYear ? `  |  Batch: ${s.academicYear}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between px-3 pb-1.5 pt-1">
              <div>
                <Barcode value={enrollNum} />
                <p className="text-gray-400 text-center mt-0.5" style={{ fontSize: 9 }}>{enrollNum}</p>
              </div>
              <div className="text-right">
                {registrarSig ? (
                  <img src={registrarSig} alt="Signature" className="h-8 ml-auto" style={{ maxWidth: 110, filter: "invert(1)" }} />
                ) : (
                  <div className="h-8 border-b border-gray-400 w-24 ml-auto" />
                )}
                <p className="text-gray-300 font-semibold" style={{ fontSize: 10 }}>Registrar</p>
              </div>
            </div>
            <div className="text-center pb-1.5">
              <p className="font-bold" style={{ color: "#e53935", fontSize: 12 }}>www.alliance.edu.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* BACK */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider no-print">Back Side</p>
        <div
          id="id-card-back"
          className="overflow-hidden shadow-2xl border border-gray-300"
          style={{ width: 540, height: 340, borderRadius: 10, fontFamily: "Arial, sans-serif", background: "#ffffff" }}
        >
          {/* Header bar */}
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "#0f1e3c", borderBottom: "3px solid #cc0000" }}>
            <img src={logoSrc} alt="AU" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-black text-white" style={{ fontSize: 16, fontFamily: "Georgia, serif", lineHeight: 1 }}>ALLIANCE UNIVERSITY</p>
              <p className="text-gray-300" style={{ fontSize: 8 }}>Chandapura - Anekal Main Road, Bengaluru - 562106, Karnataka</p>
            </div>
          </div>

          {/* Student info grid */}
          <div className="px-5 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
            <div className="col-span-2 border-b border-gray-200 pb-1.5 mb-0.5">
              <p className="font-bold text-[#0f1e3c]" style={{ fontSize: 12 }}>{s.name}</p>
              <p className="text-gray-500" style={{ fontSize: 10 }}>{s.program} — {s.department}</p>
            </div>

            {[
              ["Enrollment No.", s.enrollmentNo],
              ["Admission No.", s.admissionNo || "—"],
              ["Roll No.", s.rollNo],
              ["University Reg. No.", s.universityRegNo || "—"],
              ["Semester", `${s.semester}`],
              ["Academic Year", s.academicYear || "—"],
              ["Blood Group", s.bloodGroup || "—"],
              ["Category", s.category || "—"],
              ["Email", s.email],
              ["Phone", s.phone],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-1">
                <span className="font-semibold text-gray-600 shrink-0" style={{ width: 110 }}>{label}</span>
                <span className="text-gray-900">: {val}</span>
              </div>
            ))}
          </div>

          {/* Address + contact */}
          <div className="px-5 py-2 border-t border-gray-200 text-[10px] text-gray-600">
            <p><span className="font-semibold">Campus:</span> Alliance University, Chikkahagade Cross, Chandapura - Anekal Main Road, Anekal, Bengaluru - 562 106</p>
            <p className="mt-0.5"><span className="font-semibold">Phone:</span> +91 80 4619 9000 / 9100 &nbsp;|&nbsp; <span className="font-semibold">Email:</span> enquiry@alliance.edu.in &nbsp;|&nbsp; <span className="font-bold text-red-700">www.alliance.edu.in</span></p>
          </div>

          {/* Lost & found note */}
          <div className="mx-5 mt-1 px-3 py-1.5 border border-gray-300 rounded text-[9.5px] text-gray-500 bg-gray-50">
            If found, please return this card to the university. This card is non-transferable and should be carried at all times within campus premises.
          </div>
        </div>
      </div>
    </div>
  );
}
