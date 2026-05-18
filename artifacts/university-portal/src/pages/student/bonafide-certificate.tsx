import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";
import { format } from "date-fns";

export function BonafideCertificatePage() {
  const { data, isLoading, isError } = useGetStudentDashboard();
  const branding = useBranding();

  if (isLoading) return <div className="p-8"><Skeleton className="h-[700px]" /></div>;
  if (isError || !data) return (
    <div className="p-8 text-center text-destructive">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <p>Failed to load student data.</p>
    </div>
  );

  const { student } = data;
  const s = student as typeof student & { universityRegNo?: string; dob?: string; category?: string; };
  const logoSrc = branding.logo_round ?? "/au-logo-round.webp";
  const issueDate = format(new Date(), "dd MMMM yyyy");
  const certNo = `AU/BON/${new Date().getFullYear()}/${String(s.enrollmentNo || "").replace(/\D/g, "").slice(-4) || "0001"}`;

  const semLabels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const semLabel = semLabels[(s.semester ?? 1) - 1] || String(s.semester);

  const handlePrint = () => window.print();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonafide Certificate</h1>
          <p className="text-gray-500 text-sm mt-1">Official enrollment certificate for academic/non-academic purposes</p>
        </div>
        <Button onClick={handlePrint} className="bg-[#8b0000] hover:bg-[#6b0000]">
          <Download className="w-4 h-4 mr-2" />Print / Download
        </Button>
      </div>

      <div
        id="bonafide-cert"
        className="bg-white border border-gray-300 shadow-lg"
        style={{ fontFamily: "Times New Roman, serif", minHeight: "842px", position: "relative" }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
          <img src={logoSrc} alt="" className="w-72 h-72 object-contain" style={{ opacity: 0.04 }} />
        </div>

        {/* Border */}
        <div className="absolute inset-3 border-2 border-[#8b0000] pointer-events-none" style={{ zIndex: 0 }} />
        <div className="absolute inset-4 border border-[#8b0000] pointer-events-none" style={{ zIndex: 0, opacity: 0.4 }} />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-10 pt-8 pb-4 border-b-2 border-gray-200">
            <img src={logoSrc} alt="AU" className="w-20 h-20 object-contain" />
            <div className="text-center flex-1 px-4">
              <h1 className="font-black tracking-widest text-[#8b0000]" style={{ fontSize: "2rem", lineHeight: 1 }}>ALLIANCE</h1>
              <h1 className="font-black tracking-widest text-[#1a237e]" style={{ fontSize: "1.6rem", lineHeight: 1.1 }}>UNIVERSITY</h1>
              <p className="text-gray-500 text-xs mt-1">Established under the Karnataka Act No. 34 of 2010</p>
              <p className="text-gray-500 text-xs">Recognised by UGC, New Delhi &nbsp;|&nbsp; NAAC Grade A+</p>
            </div>
            <div className="border border-gray-400 px-3 py-2 text-center">
              <p className="text-[9px] font-bold text-gray-600 tracking-wider">NAAC</p>
              <p className="text-[9px] font-bold text-gray-600 tracking-wider">GRADE</p>
              <p className="text-2xl font-black text-[#8b0000]" style={{ lineHeight: 1 }}>A+</p>
              <p className="text-[7px] text-gray-600">ACCREDITED</p>
            </div>
          </div>

          <div className="mx-8 mt-1">
            <div className="border-t-2 border-[#1a237e]" />
            <div className="border-t border-[#1a237e] mt-0.5 opacity-50" />
          </div>

          {/* Certificate Title */}
          <div className="text-center py-6">
            <p className="font-bold tracking-widest text-gray-800 underline underline-offset-4" style={{ fontSize: "1.3rem", letterSpacing: "0.3em" }}>
              BONAFIDE CERTIFICATE
            </p>
          </div>

          {/* Reference + Date */}
          <div className="px-12 flex justify-between text-sm mb-6">
            <p><span className="font-bold">Ref. No.:</span> {certNo}</p>
            <p><span className="font-bold">Date:</span> {issueDate}</p>
          </div>

          {/* Body */}
          <div className="px-12 text-justify leading-relaxed" style={{ fontSize: "1.02rem" }}>
            <p className="mb-5">
              This is to certify that <strong>{s.name?.toUpperCase()}</strong>, Son/Daughter of{" "}
              <strong>{s.fatherName || "—"}</strong>, bearing Enrollment Number{" "}
              <strong>{s.enrollmentNo}</strong>{s.universityRegNo ? ` and University Registration Number ${s.universityRegNo}` : ""}, is a bonafide
              student of{" "}
              <strong>Alliance University, Bengaluru</strong>.
            </p>

            <p className="mb-5">
              He/She is presently pursuing{" "}
              <strong>{s.program}</strong> in the Department of{" "}
              <strong>{s.department}</strong>, School of Engineering &amp; Technology, in the{" "}
              <strong>{semLabel} Semester</strong> during the academic year{" "}
              <strong>{s.academicYear || "2024-25"}</strong>.
            </p>

            {s.dob && (
              <p className="mb-5">
                His/Her Date of Birth as per our records is{" "}
                <strong>{(() => { try { return format(new Date(s.dob), "dd MMMM yyyy"); } catch { return s.dob; } })()}</strong>.
              </p>
            )}

            <p className="mb-5">
              This certificate is issued on request of the student for the purpose of{" "}
              <strong className="underline">____________________</strong> and shall not be used for
              any other purpose.
            </p>
          </div>

          {/* Signature Block */}
          <div className="px-12 mt-12 flex justify-between items-end">
            <div className="text-center text-sm">
              <div className="h-14 border-b border-gray-600 w-40 mx-auto mb-1" />
              <p className="font-semibold">Student's Signature</p>
            </div>

            <div className="text-center text-sm">
              <img
                src="/signature-registrar.webp"
                alt="Registrar Signature"
                className="h-14 mx-auto mb-1"
                style={{ maxWidth: 160, opacity: 0.85 }}
              />
              <div className="border-t border-gray-600 pt-1 mt-1">
                <p className="font-bold">Registrar</p>
                <p className="text-gray-600 text-xs">Alliance University, Bengaluru</p>
              </div>
            </div>
          </div>

          {/* Stamp area */}
          <div className="px-12 mt-8">
            <div className="flex items-center gap-4">
              <img src={logoSrc} alt="Stamp" className="w-16 h-16 object-contain opacity-50" style={{ borderRadius: "50%", border: "1px solid #ccc", padding: 4 }} />
              <div className="text-xs text-gray-500">
                <p className="font-semibold">Official Seal — Alliance University</p>
                <p>This certificate is valid only with the official stamp and signature of the Registrar.</p>
                <p className="text-[10px] mt-0.5 text-gray-400">Generated on: {format(new Date(), "dd-MM-yyyy HH:mm")} (System Generated)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 mx-8 border-t-2 border-[#1a237e]" />
          <div className="text-center py-3 text-[10px] text-gray-500">
            <p><strong>Campus:</strong> Alliance University, Chikkahagade Cross, Chandapura-Anekal Main Road, Anekal, Bengaluru – 562 106, Karnataka</p>
            <p><strong>Phone:</strong> +91 80 4619 9000 &nbsp;|&nbsp; <strong>Email:</strong> enquiry@alliance.edu.in &nbsp;|&nbsp; <strong>Website:</strong> www.alliance.edu.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
