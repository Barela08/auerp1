import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";
import { format } from "date-fns";

export function CharacterCertificatePage() {
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
  const s = student as typeof student & { universityRegNo?: string; dob?: string; };
  const logoSrc = branding.logo_round ?? "/au-logo-round.webp";
  const issueDate = format(new Date(), "dd MMMM yyyy");
  const certNo = `AU/CHAR/${new Date().getFullYear()}/${String(s.enrollmentNo || "").replace(/\D/g, "").slice(-4) || "0001"}`;

  const semLabels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const semLabel = semLabels[(s.semester ?? 1) - 1] || String(s.semester);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Character Certificate</h1>
          <p className="text-gray-500 text-sm mt-1">Official character and conduct certificate</p>
        </div>
        <Button onClick={() => window.print()} className="bg-[#8b0000] hover:bg-[#6b0000]">
          <Download className="w-4 h-4 mr-2" />Print / Download
        </Button>
      </div>

      <div
        id="character-cert"
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
          <div className="flex flex-col items-center px-10 pt-8 pb-4 border-b-2 border-gray-200">
            <img
              src={branding.logo_horizontal ?? "/au-logo-horizontal.png"}
              alt="Alliance University"
              className="object-contain"
              style={{ height: 66, maxWidth: 400 }}
            />
            <p className="text-gray-500 text-xs mt-1.5">Chandapura-Anekal Main Road, Anekal, Bangalore – 562106</p>
            <p className="text-gray-500 text-xs">Established under Karnataka Act No. 34 of 2010 &nbsp;|&nbsp; NAAC Grade A+</p>
          </div>

          <div className="mx-8 mt-1">
            <div className="border-t-2 border-[#1a237e]" />
            <div className="border-t border-[#1a237e] mt-0.5 opacity-50" />
          </div>

          {/* Title */}
          <div className="text-center py-6">
            <p className="font-bold tracking-widest text-gray-800 underline underline-offset-4" style={{ fontSize: "1.3rem", letterSpacing: "0.3em" }}>
              CHARACTER CERTIFICATE
            </p>
          </div>

          {/* Reference + Date */}
          <div className="px-12 flex justify-between text-sm mb-6">
            <p><span className="font-bold">Ref. No.:</span> {certNo}</p>
            <p><span className="font-bold">Date:</span> {issueDate}</p>
          </div>

          {/* To whom */}
          <div className="px-12 mb-4 text-sm">
            <p className="font-bold">To Whom It May Concern,</p>
          </div>

          {/* Body */}
          <div className="px-12 text-justify leading-loose" style={{ fontSize: "1.02rem" }}>
            <p className="mb-5">
              This is to certify that <strong>{s.name?.toUpperCase()}</strong>, Son/Daughter of{" "}
              <strong>{s.fatherName || "—"}</strong>, bearing Enrollment Number{" "}
              <strong>{s.enrollmentNo}</strong>, is/was a bonafide student of{" "}
              <strong>Alliance University, Bengaluru</strong>.
            </p>

            <p className="mb-5">
              He/She was enrolled in the <strong>{s.program}</strong> programme in the Department of{" "}
              <strong>{s.department}</strong>, School of Engineering &amp; Technology, during the{" "}
              <strong>{semLabel} Semester</strong> of the academic year{" "}
              <strong>{s.academicYear || "2024-25"}</strong>.
            </p>

            <p className="mb-5">
              During his/her tenure at Alliance University, his/her conduct and character have been{" "}
              <strong>GOOD</strong>. He/She was found to be honest, hardworking, and disciplined, and
              has maintained a positive attitude in academic and co-curricular activities. No
              disciplinary action has been initiated against him/her during the period of study.
            </p>

            <p className="mb-5">
              We wish him/her all success in his/her future endeavours.
            </p>
          </div>

          {/* Signature Block */}
          <div className="px-12 mt-10 flex justify-between items-end">
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
                <p>Valid only with official stamp and signature of the Registrar.</p>
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
