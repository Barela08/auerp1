import { useState } from "react";
import { useGetMyResults, useGetStudentDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, GraduationCap, Download } from "lucide-react";
import { format } from "date-fns";
import { useBranding } from "@/contexts/branding-context";

interface Subject {
  subjectCode: string;
  subjectName: string;
  credits: number;
  iaMarks: number;
  eaMarks: number;
  totalMarks: number;
  maxIa: number;
  maxEa: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
}

const GRADE_SCALE = [
  { gp: 10, grade: "O" }, { gp: 9, grade: "A+" }, { gp: 8, grade: "A" },
  { gp: 7, grade: "B+" }, { gp: 6, grade: "B" }, { gp: 5, grade: "C" },
  { gp: 4, grade: "P" }, { gp: 0, grade: "F" },
];

export function ResultsPage() {
  const { data, isLoading, isError } = useGetMyResults();
  const { data: dashData } = useGetStudentDashboard();
  const branding = useBranding();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  if (isLoading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
    </div>
  );

  if (isError || !data) return (
    <div className="p-8 text-center text-destructive">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <p>Failed to load results.</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="p-8 text-center">
      <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">No results published yet.</p>
    </div>
  );

  const activeResult = selectedSemester !== null
    ? data.find(r => r.semester === selectedSemester)
    : data[data.length - 1];

  const subjects = (activeResult?.subjects ?? []) as Subject[];
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const totalMarks = subjects.reduce((s, sub) => s + sub.totalMarks, 0);
  const maxMarks = subjects.reduce((s, sub) => s + sub.maxTotal, 0);

  const student = dashData?.student as any;
  const logoSrc = branding.logo_round ?? "/au-logo-main.png";
  const semLabels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const semLabel = activeResult ? (semLabels[(activeResult.semester ?? 1) - 1] || activeResult.semester) : "—";
  const equivalentPct = activeResult?.sgpa ? ((activeResult.sgpa / 10) * 100).toFixed(2) : "—";

  const handleDownload = () => window.print();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Selector + Download */}
      <div className="flex justify-between items-center flex-wrap gap-3 no-print">
        <div className="flex gap-2 flex-wrap">
          {data.map((r) => (
            <Button
              key={r.semester}
              size="sm"
              variant={activeResult?.semester === r.semester ? "default" : "outline"}
              onClick={() => setSelectedSemester(r.semester)}
            >
              Sem {r.semester}
            </Button>
          ))}
        </div>
        {activeResult && (
          <Button onClick={handleDownload} className="bg-[#8b0000] hover:bg-[#6b0000]">
            <Download className="w-4 h-4 mr-2" />Download Marksheet
          </Button>
        )}
      </div>

      {activeResult && (
        <div className="bg-white border border-gray-400 shadow-lg" id="marksheet" style={{ fontFamily: "Arial, sans-serif" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b-2 border-gray-300">
            <img src={logoSrc} alt="AU" className="w-16 h-16 object-contain" />
            <div className="text-center flex-1 px-2">
              <h1 className="font-black tracking-widest text-[#8b0000]" style={{ fontSize: "1.8rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>ALLIANCE</h1>
              <h1 className="font-black tracking-widest text-[#1a237e]" style={{ fontSize: "1.45rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>UNIVERSITY</h1>
              <p className="text-gray-600 text-[10px] mt-1">Private University established in Karnataka State by Act No.34 of year 2010</p>
              <p className="text-gray-600 text-[10px]">Recognised by the University Grants Commission (UGC), New Delhi</p>
            </div>
            <div className="border border-gray-400 px-2 py-1 text-center">
              <p className="text-[9px] font-bold text-gray-600">NAAC</p>
              <p className="text-[9px] font-bold text-gray-600">GRADE</p>
              <p className="text-xl font-black text-[#8b0000]" style={{ lineHeight: 1 }}>A+</p>
              <p className="text-[7px] text-gray-600">ACCREDITED</p>
              <p className="text-[7px] text-gray-600">UNIVERSITY</p>
            </div>
          </div>

          <div className="mx-4 mt-1">
            <div className="border-t-2 border-[#1a237e]" />
            <div className="border-t border-[#1a237e] mt-px" />
          </div>

          {/* Title */}
          <div className="text-center py-2.5">
            <p className="font-bold tracking-widest text-gray-800" style={{ fontSize: 14, letterSpacing: "0.2em" }}>
              SEMESTER GRADE REPORT
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              — Examination : MAY-JUNE {activeResult.academicYear} —
            </p>
          </div>

          {/* Sl. No. top right */}
          <div className="px-6 text-right text-[11px] text-gray-600 -mt-1 mb-1">
            Sl. No. : AU/R/{activeResult.academicYear || "2023-24"}/000{String(activeResult.id ?? 123).padStart(3, "0")}
          </div>

          {/* Student details + photo */}
          <div className="px-6 pb-3 flex gap-4">
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[11.5px]">
              <div className="space-y-0.5">
                {[
                  ["Name of the Student", student?.name || activeResult.studentName || "—"],
                  ["Father's Name", student?.fatherName || "—"],
                  ["Mother's Name", student?.motherName || "—"],
                  ["Enrollment No.", student?.enrollmentNo || "—"],
                  ["Program", student?.program || "—"],
                  ["Department", student?.department || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="font-semibold text-gray-700 shrink-0" style={{ width: 120 }}>{label}</span>
                    <span>: {val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                {[
                  ["Date of Birth", student?.dob ? (() => { try { return format(new Date(student.dob), "dd-MM-yyyy"); } catch { return student.dob; } })() : "—"],
                  ["Roll No.", student?.rollNo || "—"],
                  ["Semester", `${semLabel} SEMESTER`],
                  ["Academic Year", activeResult.academicYear || "—"],
                  ["Result Status", (activeResult.status || "PASS").toUpperCase()],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="font-semibold text-gray-700 shrink-0" style={{ width: 120 }}>{label}</span>
                    <span>: {val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo + student signature */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="border border-gray-400 flex items-center justify-center bg-gray-100" style={{ width: 75, height: 90 }}>
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>
              <div className="h-5 border-b border-gray-500 w-20 mt-1" />
              <p className="text-[9px] text-gray-600 text-center">Student's Signature</p>
            </div>
          </div>

          {/* Marks table */}
          <div className="px-4 pb-2">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr style={{ background: "#1a237e" }}>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 28 }}>Sl.<br/>No.</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 58 }}>Course<br/>Code</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Course Title</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" colSpan={4}>Marks Obtained</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 42 }}>Grade<br/>Point<br/>(GP)</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 42 }}>Letter<br/>Grade</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 38 }}>Credits</th>
                </tr>
                <tr style={{ background: "#1e2fa0" }}>
                  {[`CA\nMax.${subjects[0]?.maxIa || 30}`, `End Sem\nMax.${subjects[0]?.maxEa || 50}`, `Total\nMax.${subjects[0]?.maxTotal || 100}`, "Result"].map((h, i) => (
                    <th key={i} className="text-white py-1 px-1.5 text-center font-semibold border border-[#0d1a5e]" style={{ fontSize: 9, width: 42 }}>{h.split("\n").map((l, j) => <span key={j}>{l}{j === 0 && <br/>}</span>)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => (
                  <tr key={i} className="border-b border-gray-200" style={{ background: i % 2 === 0 ? "#fff" : "#f7f8ff" }}>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200">{i + 1}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-mono">{sub.subjectCode}</td>
                    <td className="px-2 py-1.5 border-r border-gray-200">{sub.subjectName}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200">{sub.iaMarks}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200">{sub.eaMarks}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-semibold">{sub.totalMarks}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-bold text-[#1a237e]">{sub.grade}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-bold">{sub.gradePoint}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-bold">{sub.grade}</td>
                    <td className="px-1.5 py-1.5 text-center font-semibold">{sub.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary + Formula */}
          <div className="px-4 pb-2 flex gap-4">
            <div className="flex-1 text-[11px] space-y-0.5">
              {[
                ["Total Credits Earned", String(totalCredits)],
                ["SGPA", activeResult.sgpa?.toFixed(2) || "—"],
                ["CGPA (Cumulative)", activeResult.cgpa?.toFixed(2) || "—"],
                ["Equivalent Percentage", equivalentPct + " %"],
                ["Result Declared On", activeResult.resultDate ? format(new Date(activeResult.resultDate), "dd-MM-yyyy") : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-1">
                  <span className="font-semibold text-gray-700 shrink-0" style={{ width: 150 }}>{label}</span>
                  <span>: <strong>{val}</strong></span>
                </div>
              ))}
            </div>

            {/* SGPA Formula box */}
            <div className="border border-gray-300 p-2 text-center shrink-0" style={{ minWidth: 200 }}>
              <p className="text-[10px] font-bold text-gray-700 mb-1">SGPA / CGPA Formula :</p>
              <p className="text-[11px] font-semibold text-gray-800">SGPA (Si) =</p>
              <div className="flex items-center justify-center gap-1 my-1">
                <div className="text-center text-[10px]">
                  <div className="border-b border-gray-600 pb-0.5 mb-0.5">Σ (Ci × GPi)</div>
                  <div>Σ Ci</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-600 text-left mt-1 space-y-0.5">
                <p>Si = Semester Grade Point Average</p>
                <p>Ci = Credits Earned in i<sup>th</sup> Course</p>
                <p>GPi = Grade Point in i<sup>th</sup> Course</p>
              </div>
            </div>
          </div>

          {/* Grade scale */}
          <div className="px-4 pb-2 pt-1">
            <table className="border-collapse text-[10.5px]">
              <tbody>
                <tr style={{ background: "#f0f0f0" }}>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-gray-700">Grade Point (GP)</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.gp} className="border border-gray-400 px-3 py-1 text-center font-bold">{g.gp}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-gray-700">Letter Grade</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.grade} className="border border-gray-400 px-3 py-1 text-center font-bold">{g.grade}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="px-6 pt-2 pb-3 flex items-end justify-between border-t border-gray-200">
            <div className="text-center text-[10px]">
              {branding.signature_controller ? (
                <img src={branding.signature_controller} alt="Controller Sig" className="h-10 mx-auto" style={{ maxWidth: 120 }} />
              ) : (
                <div className="h-10 border-b border-gray-500 w-28 mx-auto" />
              )}
              <div className="border-t border-gray-500 mt-1 pt-0.5">Controller of Examinations</div>
            </div>
            <div className="text-center text-[10px]">
              <img src={logoSrc} alt="Stamp" className="w-14 h-14 mx-auto object-contain opacity-60" />
            </div>
            <div className="text-center text-[10px]">
              {branding.signature_registrar ? (
                <img src={branding.signature_registrar} alt="Registrar Sig" className="h-10 mx-auto" style={{ maxWidth: 120 }} />
              ) : (
                <div className="h-10 border-b border-gray-500 w-28 mx-auto" />
              )}
              <div className="border-t border-gray-500 mt-1 pt-0.5">Registrar</div>
            </div>
          </div>

          {/* Notes */}
          <div className="px-6 pb-2 text-[9px] text-gray-500 space-y-0.5 border-t border-gray-100">
            <p>Note :</p>
            <p>1. This is an electronically generated report and is valid only when printed on official university letterhead.</p>
            <p>2. This grade card is valid only if signed and stamped by the authorized signatories.</p>
            <p>3. For any query, please contact the Examination Section.</p>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#1a237e] mx-4 mt-1" />
          <div className="text-center py-2 text-[9.5px] text-gray-600">
            <p><span className="font-semibold">Campus:</span> Alliance University, Chandapura - Anekal Main Road, Bengaluru – 562106, Karnataka, India.</p>
            <p><span className="font-semibold">Phone:</span> +91 80 4619 0000 &nbsp;|&nbsp; <span className="font-semibold">Email:</span> info@alliance.edu.in &nbsp;|&nbsp; <span className="font-semibold">Website:</span> www.alliance.edu.in</p>
          </div>
        </div>
      )}
    </div>
  );
}
