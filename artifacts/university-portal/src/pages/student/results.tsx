import { useState } from "react";
import { useGetMyResults } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, GraduationCap, Printer } from "lucide-react";
import { format } from "date-fns";

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
  { grade: "O", gp: 10 }, { grade: "A+", gp: 9 }, { grade: "A", gp: 8 },
  { grade: "B+", gp: 7 }, { grade: "B", gp: 6 }, { grade: "C", gp: 5 },
  { grade: "P", gp: 4 }, { grade: "F", gp: 0 }, { grade: "Ab", gp: 0 },
];

export function ResultsPage() {
  const { data, isLoading, isError } = useGetMyResults();
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

  const activeResult = selectedSemester !== null
    ? data.find(r => r.semester === selectedSemester)
    : data[data.length - 1];

  if (data.length === 0) return (
    <div className="p-8 text-center">
      <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">No results published yet.</p>
    </div>
  );

  const subjects = (activeResult?.subjects ?? []) as Subject[];
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const totalMarks = subjects.reduce((s, sub) => s + sub.totalMarks, 0);
  const maxMarks = subjects.reduce((s, sub) => s + sub.maxTotal, 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Semester selector + print */}
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
          <Button onClick={() => window.print()} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />Print Marksheet
          </Button>
        )}
      </div>

      {activeResult && (
        /* ── MARKSHEET DOCUMENT ── */
        <div className="bg-white border border-gray-300 shadow-lg" id="marksheet" style={{ fontFamily: "Arial, sans-serif" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b-2 border-gray-300">
            <img src="/au-logo-round.webp" alt="AU" className="w-16 h-16 object-contain" />
            <div className="text-center flex-1 px-2">
              <h1 className="font-black tracking-widest text-[#8b0000]" style={{ fontSize: "1.8rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>ALLIANCE</h1>
              <h1 className="font-black tracking-widest text-[#1a237e]" style={{ fontSize: "1.45rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>UNIVERSITY</h1>
              <p className="text-gray-600 text-[10px] mt-1">Private University established in Karnataka State by Act No.34 of year 2010</p>
              <p className="text-gray-600 text-[10px]">Recognised by the University Grants Commission (UGC), New Delhi</p>
            </div>
            <div className="border border-gray-400 px-2 py-1 text-center">
              <p className="text-[8px] font-bold text-gray-600 tracking-wider">NAAC</p>
              <p className="text-[8px] font-bold text-gray-600 tracking-wider">GRADE</p>
              <p className="text-lg font-black text-[#8b0000]" style={{ lineHeight: 1 }}>A+</p>
              <p className="text-[7px] text-gray-600">ACCREDITED</p>
              <p className="text-[7px] text-gray-600">UNIVERSITY</p>
            </div>
          </div>

          <div className="mx-4 mt-1">
            <div className="border-t-2 border-[#1a237e]" />
            <div className="border-t border-[#1a237e] mt-px" />
          </div>

          {/* Title */}
          <div className="text-center py-3">
            <p className="font-bold tracking-widest text-gray-800" style={{ fontSize: 13, letterSpacing: "0.2em" }}>
              STATEMENT OF MARKS / RESULT
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Examination : MAY-JUNE {activeResult.academicYear}
            </p>
          </div>

          {/* Sl. No. top right */}
          <div className="px-6 text-right text-[11px] text-gray-600 -mt-2 mb-1">
            Sl. No. : AU/R/{activeResult.academicYear || "2023-24"}/000{activeResult.id ?? 123}
          </div>

          {/* Student details + photo */}
          <div className="px-6 pb-3 flex gap-4">
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1 text-[11.5px]">
              <div className="space-y-1">
                {[
                  ["Enrollment No.", "—"],
                  ["Roll Number", "—"],
                  ["Student Name", activeResult.studentName || "—"],
                  ["Father's Name", "—"],
                  ["Program", "B.Tech (Computer Science & Engineering)"],
                  ["School", "School of Engineering & Technology"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="w-28 font-semibold text-gray-700 shrink-0">{label}</span>
                    <span>: {val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {[
                  ["Semester", activeResult.semester ? `${["I","II","III","IV","V","VI","VII","VIII"][activeResult.semester-1] || activeResult.semester} SEMESTER` : "—"],
                  ["Academic Year", activeResult.academicYear || "2023-24"],
                  ["Date of Result", activeResult.resultDate ? format(new Date(activeResult.resultDate), "dd-MM-yyyy") : "—"],
                  ["Result Status", (activeResult.status || "pass").toUpperCase()],
                  ["Credits Earned", String(totalCredits)],
                  ["SGPA", activeResult.sgpa?.toFixed(2) || "—"],
                  ["CGPA", activeResult.cgpa?.toFixed(2) || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1">
                    <span className="w-28 font-semibold text-gray-700 shrink-0">{label}</span>
                    <span>: {val}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Photo + signature */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="border border-gray-400 flex items-center justify-center bg-gray-100" style={{ width: 72, height: 88 }}>
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <img src="/signature-registrar.webp" alt="Student Sig" className="h-5" style={{ maxWidth: 72 }} />
              <p className="text-[9px] text-gray-600 text-center">Student Signature</p>
            </div>
          </div>

          {/* Marks table */}
          <div className="px-4 pb-2">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#1a237e" }}>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>S. No.</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Course Code</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Course Name</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Credits</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" colSpan={3}>Marks Obtained</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" colSpan={3}>Max Marks</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Grade</th>
                  <th className="text-white py-1.5 px-2 text-center font-bold border border-[#0d1a5e]" rowSpan={2}>Grade Point</th>
                </tr>
                <tr style={{ background: "#1a237e" }}>
                  {["IA", "EA", "Total", "IA", "EA", "Total"].map((h, i) => (
                    <th key={i} className="text-white py-1 px-2 text-center font-semibold border border-[#0d1a5e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={i} className="border-b border-gray-200" style={{ background: i % 2 === 0 ? "#fff" : "#f7f8ff" }}>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{i + 1}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200 font-mono">{s.subjectCode}</td>
                    <td className="px-2 py-1.5 border-r border-gray-200">{s.subjectName}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.credits}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.iaMarks}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.eaMarks}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200 font-semibold">{s.totalMarks}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.maxIa}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.maxEa}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200">{s.maxTotal}</td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200 font-bold">{s.grade}</td>
                    <td className="px-2 py-1.5 text-center font-bold text-[#1a237e]">{s.gradePoint}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td colSpan={3} className="px-2 py-1.5 text-right border-r border-gray-300">Total Credits</td>
                  <td className="px-2 py-1.5 text-center border-r border-gray-300">{totalCredits}</td>
                  <td colSpan={2} className="border-r border-gray-300" />
                  <td className="px-2 py-1.5 text-center border-r border-gray-300">{totalMarks} / {maxMarks}</td>
                  <td colSpan={3} className="border-r border-gray-300" />
                  <td className="px-2 py-1.5 text-center border-r border-gray-300">{activeResult.sgpa?.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center font-bold text-[#1a237e]">CGPA {activeResult.cgpa?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grade scale */}
          <div className="px-4 pb-3 pt-1">
            <p className="text-center font-bold text-[11px] tracking-wider text-gray-700 mb-1">GRADE POINTS SCALE</p>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-center text-gray-700">Letter Grade</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.grade} className="border border-gray-400 px-2 py-1 text-center font-bold">{g.grade}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 font-bold text-center text-gray-700">Grade Point</td>
                  {GRADE_SCALE.map(g => (
                    <td key={g.grade} className="border border-gray-400 px-2 py-1 text-center">{g.gp}</td>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Result status */}
          <div className="text-center pb-2">
            <p className="font-bold text-[11px] text-gray-700 tracking-wider">RESULT STATUS</p>
            <div className="inline-block mt-1 px-8 py-1 border border-gray-400">
              <p className="font-black text-sm tracking-widest text-gray-900">{(activeResult.status || "PASS").toUpperCase()}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="px-6 pt-2 pb-3 flex items-end justify-between border-t border-gray-200">
            <div className="text-center text-[10px]">
              <img src="/signature-controller.webp" alt="Controller Sig" className="h-10 mx-auto" style={{ maxWidth: 120 }} />
              <div className="border-t border-gray-500 mt-1 pt-0.5">Controller of Examinations</div>
            </div>
            <div className="text-center text-[10px]">
              <img src="/au-logo-round.webp" alt="Stamp" className="w-14 h-14 mx-auto object-contain opacity-70" />
              <div className="mt-1 text-gray-600 text-[9px]">
                <p>Note :</p>
                <p>1. This is system generated mark sheet.</p>
                <p>2. No signature is required.</p>
                <p>3. For any query, contact the examination cell.</p>
              </div>
            </div>
            <div className="text-center text-[10px]">
              <img src="/signature-registrar.webp" alt="Registrar Sig" className="h-10 mx-auto" style={{ maxWidth: 120 }} />
              <div className="border-t border-gray-500 mt-1 pt-0.5">Registrar</div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#1a237e] mx-4" />
          <div className="text-center py-2 text-[9.5px] text-gray-600">
            <p><span className="font-semibold">Campus:</span> Alliance University, Chandapura - Anekal Main Road, Bengaluru – 562106, Karnataka, India.</p>
            <p><span className="font-semibold">Phone:</span> +91 80 4619 0000 &nbsp;|&nbsp; <span className="font-semibold">Email:</span> info@alliance.edu.in &nbsp;|&nbsp; <span className="font-semibold">Website:</span> www.alliance.edu.in</p>
          </div>
        </div>
      )}
    </div>
  );
}
