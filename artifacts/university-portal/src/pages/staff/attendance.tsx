import { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, CheckCircle, XCircle, Clock, Save, Search, Loader2, AlertCircle } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "late";

type StudentRow = {
  id: number;
  name: string;
  enrollmentNo: string;
  program: string;
  semester: number;
  section?: string;
};

export function StaffAttendancePage() {
  const { data: allStudents, isLoading } = useListStudents();

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectId, setSubjectId] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<"setup" | "mark">("setup");

  const students = ((allStudents || []) as StudentRow[]).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase())
  );

  const initAttendance = () => {
    if (!subjectName.trim() || !date) return;
    const initial: Record<number, AttendanceStatus> = {};
    (allStudents || []).forEach((s: any) => { initial[s.id] = "present"; });
    setAttendance(initial);
    setStep("mark");
    setSuccessMsg("");
    setErrorMsg("");
  };

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<number, AttendanceStatus> = {};
    (allStudents || []).forEach((s: any) => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        subjectId: parseInt(subjectId) || 1,
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim() || null,
        date,
        students: Object.entries(attendance).map(([id, status]) => ({
          studentId: parseInt(id),
          status,
        })),
      };
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save attendance");
      const present = Object.values(attendance).filter(s => s === "present").length;
      const absent = Object.values(attendance).filter(s => s === "absent").length;
      const late = Object.values(attendance).filter(s => s === "late").length;
      setSuccessMsg(`Attendance saved! Present: ${present}, Absent: ${absent}, Late: ${late}`);
      setStep("setup");
      setSubjectName("");
      setSubjectCode("");
    } catch {
      setErrorMsg("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount = Object.values(attendance).filter(s => s === "late").length;
  const total = Object.values(attendance).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500 mt-1">Mark subject-wise, date-wise attendance for students</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-4 py-3 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {step === "setup" ? (
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Session Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Subject Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. Data Structures and Algorithms"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Subject Code</Label>
                <Input
                  placeholder="e.g. CS401"
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Subject ID</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={initAttendance}
              disabled={!subjectName.trim() || !date || isLoading}
              className="bg-[#8b0000] hover:bg-[#6b0000] w-full md:w-auto"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Start Marking Attendance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> Present: {presentCount}
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                <XCircle className="w-4 h-4" /> Absent: {absentCount}
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                <Clock className="w-4 h-4" /> Late: {lateCount}
              </div>
              <span className="text-sm text-gray-400">/ {total} total</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll("present")} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark All Present</Button>
              <Button size="sm" variant="outline" onClick={() => markAll("absent")} className="text-red-600 border-red-200 hover:bg-red-50">Mark All Absent</Button>
              <Button size="sm" variant="outline" onClick={() => { setStep("setup"); setAttendance({}); }}>Change Subject</Button>
            </div>
          </div>

          {/* Subject info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex items-center gap-4 text-sm">
              <div><span className="text-gray-500">Subject:</span> <span className="font-semibold">{subjectName}</span>{subjectCode && <span className="ml-2 text-gray-400">({subjectCode})</span>}</div>
              <div><span className="text-gray-500">Date:</span> <span className="font-semibold">{date}</span></div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Student list */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
              ) : (
                <div className="divide-y">
                  {students.map(s => {
                    const status = attendance[s.id] || "present";
                    return (
                      <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.enrollmentNo} · {s.program} · Sem {s.semester}{s.section ? ` · Sec ${s.section}` : ""}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <button
                            onClick={() => setStatus(s.id, "present")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                              status === "present"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Present
                          </button>
                          <button
                            onClick={() => setStatus(s.id, "late")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                              status === "late"
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Late
                          </button>
                          <button
                            onClick={() => setStatus(s.id, "absent")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                              status === "absent"
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {students.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-sm">No students found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setStep("setup"); setAttendance({}); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || total === 0}
              className="bg-[#8b0000] hover:bg-[#6b0000]"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Attendance ({total} students)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
