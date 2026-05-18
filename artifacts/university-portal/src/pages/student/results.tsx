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
  { gp: 4, grade: "P" }, { gp: 0, grade: "F" }, { gp: "-", grade: "Ab" },
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
  const totalCredits = subjects.reduce((s, sub) => s + (sub.credits || 0), 0);
  const totalObtained = subjects.reduce((s, sub) => s + (sub.totalMarks || 0), 0);
  const totalMax = subjects.reduce((s, sub) => s + (sub.maxTotal || 100), 0);

  const student = dashData?.student as any;
  const logoSrc = branding.logo_round ?? "/au-logo-round.webp";
  const semLabels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const semLabel = activeResult ? (semLabels[(activeResult.semester ?? 1) - 1] || activeResult.semester) : "—";
  const equivalentPct = activeResult?.sgpa ? ((activeResult.sgpa / 10) * 100).toFixed(2) : "—";
  const slNo = `AU/R/${activeResult?.academicYear || "2023-24"}/000${String(activeResult?.id ?? 123).padStart(3, "0")}`;

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
              onClick={() => setSelectedSemester(r.semester ?? null)}
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

          {/* ── HEADER ── */}
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

          {/* ── TITLE ── */}
          <div className="text-center py-2.5">
            <p className="font-bold tracking-widest text-gray-800" style={{ fontSize: 14, letterSpacing: "0.2em" }}>
              STATEMENT OF MARKS / RESULT
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              — Examination : MAY-JUNE {activeResult.academicYear} —
            </p>
          </div>

          {/* Sl. No. */}
          <div className="px-6 text-right text-[11px] text-gray-600 -mt-1 mb-1">
            Sl. No. : {slNo}
          </div>

          {/* ── STUDENT DETAILS + PHOTO ── */}
          <div className="px-6 pb-3 flex gap-4">
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[11.5px]">
              <div className="space-y-0.5">
                {[
                  ["Enrollment No.", student?.enrollmentNo || "—"],
                  ["Roll Number", student?.rollNo || "—"],
                  ["Student Name", student?.name || activeResult.studentName || "—"],
                  ["Father's Name", student?.fatherName || "—"],
                  ["Program", student?.program || "—"],
                  ["School", "School of Engineering & Technology"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="font-semibold text-gray-700 shrink-0" style={{ width: 120 }}>{label}</span>
                    <span>: {val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                {[
                  ["Semester", `${semLabel} SEMESTER`],
                  ["Academic Year", activeResult.academicYear || "—"],
                  ["Date of Result", activeResult.resultDate ? (() => { try { return format(new Date(activeResult.resultDate), "dd-MM-yyyy"); } catch { return activeResult.resultDate; } })() : "—"],
                  ["Result Status", (activeResult.status || "PASS").toUpperCase()],
                  ["Credits Earned", String(totalCredits)],
                  ["SGPA", activeResult.sgpa?.toFixed(2) || "—"],
                  ["CGPA", activeResult.cgpa?.toFixed(2) || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="font-semibold text-gray-700 shrink-0" style={{ width: 120 }}>{label}</span>
                    <span>: <strong>{val}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo + Student Signature */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="border border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden" style={{ width: 75, height: 90 }}>
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>
              <p className="text-[9px] text-gray-600 text-center mt-1">{student?.name?.split(" ")[0] || "Student"}</p>
              <div className="h-5 border-b border-gray-500 w-20 mt-1" />
              <p className="text-[9px] text-gray-600 text-center">Student Signature</p>
              {/* QR placeholder */}
              <div className="border border-gray-300 mt-1 flex items-center justify-center bg-gray-50" style={{ width: 44, height: 44 }}>
                <p className="text-[7px] text-gray-400 text-center leading-tight">QR<br/>Code</p>
              </div>
              <p className="text-[8px] text-gray-500">{student?.enrollmentNo || "AU2021CS001"}</p>
            </div>
          </div>

          {/* ── MARKS TABLE ── */}
          <div className="px-4 pb-2">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr style={{ background: "#1a237e" }}>
                  <th className="text-white py-1.5 px-1 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 26 }}>S.<br/>No.</th>
                  <th className="text-white py-1.5 px-1.5 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 58 }}>Course<br/>Code</th>
                  <th className="text-white py-1.5 px-2 text-left font-bold border border-[#0d1a5e]" rowSpan={2}>Course Name</th>
                  <th className="text-white py-1.5 px-1 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 34 }}>Cre-<br/>dits</th>
                  <th className="text-white py-1 px-1 text-center font-bold border border-[#0d1a5e]" colSpan={3}>Marks Obtained</th>
                  <th className="text-white py-1 px-1 text-center font-bold border border-[#0d1a5e]" colSpan={3}>Max Marks</th>
                  <th className="text-white py-1.5 px-1 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 36 }}>Grade</th>
                  <th className="text-white py-1.5 px-1 text-center font-bold border border-[#0d1a5e]" rowSpan={2} style={{ width: 36 }}>Grade<br/>Point</th>
                </tr>
                <tr style={{ background: "#1e2fa0" }}>
                  {["IA", "EA", "Total", "IA", "EA", "Total"].map((h, i) => (
                    <th key={i} className="text-white py-1 px-1 text-center font-semibold border border-[#0d1a5e]" style={{ fontSize: 10, width: 34 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => (
                  <tr key={i} className="border-b border-gray-200" style={{ background: i % 2 === 0 ? "#fff" : "#f7f8ff" }}>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200">{i + 1}</td>
                    <td className="px-1.5 py-1.5 text-center border-r border-gray-200 font-mono text-[10px]">{sub.subjectCode}</td>
                    <td className="px-2 py-1.5 border-r border-gray-200">{sub.subjectName}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200">{sub.credits}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200">{sub.iaMarks ?? "—"}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200">{sub.eaMarks ?? "—"}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200 font-semibold">{sub.totalMarks ?? "—"}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200 text-gray-500">{sub.maxIa ?? 30}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200 text-gray-500">{sub.maxEa ?? 70}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200 text-gray-500">{sub.maxTotal ?? 100}</td>
                    <td className="px-1 py-1.5 text-center border-r border-gray-200 font-bold text-[#1a237e]">{sub.grade}</td>
                    <td className="px-1 py-1.5 text-center font-bold">{sub.gradePoint}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr style={{ background: "#eef0fa" }}>
                  <td colSpan={3} className="px-2 py-1.5 font-bold border-t border-gray-300 text-right">Total Credits</td>
                  <td className="px-1 py-1.5 text-center border-t border-l border-gray-300 font-bold">{totalCredits}</td>
                  <td colSpan={2} className="border-t border-gray-300" />
                  <td className="px-1 py-1.5 text-center border-t border-gray-300 font-bold">{totalObtained}</td>
                  <td colSpan={2} className="border-t border-gray-300" />
                  <td className="px-1 py-1.5 text-center border-t border-gray-300 font-bold">{totalMax}</td>
                  <td className="border-t border-gray-300" />
                  <td className="px-1 py-1.5 text-center border-t border-gray-300 font-bold">
                    {activeResult.sgpa?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── SUMMARY + FORMULA ── */}
          <div className="px-4 pb-2 flex gap-6 items-start">
            <div className="flex-1 text-[11px] space-y-0.5 pt-1">
              {[
                ["Total Credits Earned", String(totalCredits)],
                ["SGPA", activeResult.sgpa?.toFixed(2) || "—"],
                ["CGPA (Cumulative)", activeResult.cgpa?.toFixed(2) || "—"],
                ["Equivalent Percentage", `${equivalentPct} %`],
                ["Result Declared On", activeResult.resultDate ? (() => { try { return format(new Date(activeResult.resultDate), "dd-MM-yyyy"); } catch { return activeResult.resultDate; } })() : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-1">
                  <span className="font-semibold text-gray-700 shrink-0" style={{ width: 155 }}>{label}</span>
                  <span>: <strong>{val}</strong></span>
                </div>
              ))}
            </div>

            {/* SGPA Formula */}
            <div className="border border-gray-300 p-2 text-center shrink-0" style={{ minWidth: 210 }}>
              <p className="text-[10px] font-bold text-gray-700 mb-1">SGPA / CGPA Formula :</p>
              <div className="flex items-center justify-center gap-2 my-1">
                <p className="text-[11px] font-semibold text-gray-800">SGPA (Si) =</p>
                <div className="text-center text-[10px]">
                  <div className="border-b border-gray-600 pb-0.5 mb-0.5">Σ (Ci × GPi)</div>
                  <div>Σ Ci</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-600 text-left mt-1 space-y-0.5 px-1">
                <p>Si = Semester Grade Point Average</p>
                <p>Ci = Credits Earned in i<sup>th</sup> Course</p>
                <p>GPi = Grade Point in i<sup>th</sup> Course</p>
              </div>
            </div>
          </div>

          {/* ── GRADE SCALE ── */}
          <div className="px-4 pb-3 pt-1">
            <p className="text-[10px] font-bold text-gray-600 mb-1">Grade Point &amp; Letter Grade</p>
            <table className="border-collapse text-[10.5px]">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-gray-700 bg-gray-50">Grade Point (GP)</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.gp} className="border border-gray-400 px-2.5 py-1 text-center font-bold">{g.gp}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-gray-700 bg-gray-50">Letter Grade</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.grade} className="border border-gray-400 px-2.5 py-1 text-center font-bold">{g.grade}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── RESULT STATUS ── */}
          <div className="text-center pb-2">
            <p className="text-[11px] font-bold text-gray-700 tracking-wider">RESULT STATUS</p>
            <p className="font-black text-[#1a237e] tracking-widest" style={{ fontSize: 16 }}>
              {(activeResult.status || "PASS").toUpperCase()}
            </p>
          </div>

          {/* ── SIGNATURES ── */}
          <div className="px-8 pt-2 pb-4 flex items-end justify-between border-t border-gray-200">
            <div className="text-center text-[10px]">
              {branding.signature_controller ? (
                <img src={branding.signature_controller} alt="Controller Sig" className="h-10 mx-auto" style={{ maxWidth: 130 }} />
              ) : (
                <img src="/signature-controller.webp" alt="Signature" className="h-10 mx-auto" style={{ maxWidth: 130, opacity: 0.8 }} />
              )}
              <div className="border-t border-gray-500 mt-1 pt-0.5 font-semibold">Controller of Examinations</div>
            </div>
            <div className="text-center text-[10px]">
              <img src={logoSrc} alt="Stamp" className="w-14 h-14 mx-auto object-contain opacity-60" />
            </div>
            <div className="text-center text-[10px]">
              {branding.signature_registrar ? (
                <img src={branding.signature_registrar} alt="Registrar Sig" className="h-10 mx-auto" style={{ maxWidth: 130 }} />
              ) : (
                <img src="/signature-registrar.webp" alt="Signature" className="h-10 mx-auto" style={{ maxWidth: 130, opacity: 0.8 }} />
              )}
              <div className="border-t border-gray-500 mt-1 pt-0.5 font-semibold">Registrar</div>
            </div>
          </div>

          {/* ── NOTES ── */}
          <div className="px-6 pb-2 text-[9.5px] text-gray-500 space-y-0.5 border-t border-gray-100">
            <p>Note :</p>
            <p>1. This is a system generated mark sheet.</p>
            <p>2. No signature is required.</p>
            <p>3. For any query, contact the examination cell.</p>
          </div>

          {/* ── FOOTER ── */}
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
