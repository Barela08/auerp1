import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, Plus, Trash2, Search, ChevronDown, ChevronUp, CheckCircle, XCircle
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  enrollmentNo?: string;
  program?: string;
  semester?: number;
}

interface SubjectEntry {
  name: string;
  code: string;
  credits: string;
  grade: string;
  marksObtained: string;
  maxMarks: string;
}

async function fetchStudents(): Promise<Student[]> {
  const res = await fetch("/api/students", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

interface ResultRecord {
  id: number;
  studentId: number;
  semester: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  status: string;
  studentName?: string;
  enrollmentNo?: string;
  program?: string;
}

async function fetchResults(): Promise<ResultRecord[]> {
  const res = await fetch("/api/results", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const GRADES = ["O", "A+", "A", "B+", "B", "C", "P", "F", "Ab"];

const emptySubject = (): SubjectEntry => ({
  name: "", code: "", credits: "3", grade: "O", marksObtained: "", maxMarks: "100"
});

export function StaffResultsPage() {
  const queryClient = useQueryClient();
  const { data: students, isLoading: studentsLoading } = useQuery({ queryKey: ["students"], queryFn: fetchStudents });
  const { data: results, isLoading: resultsLoading } = useQuery({ queryKey: ["all-results"], queryFn: fetchResults });

  const [showForm, setShowForm] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    semester: "",
    academicYear: "2024-25",
    sgpa: "",
    cgpa: "",
    totalCredits: "",
    status: "Pass",
    resultDate: new Date().toISOString().split("T")[0],
  });
  const [subjects, setSubjects] = useState<SubjectEntry[]>([emptySubject()]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [resultSearch, setResultSearch] = useState("");

  const filteredStudents = (students ?? []).filter((s) => {
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.enrollmentNo ?? "").toLowerCase().includes(q);
  }).slice(0, 8);

  const addSubject = () => setSubjects([...subjects, emptySubject()]);
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, field: keyof SubjectEntry, value: string) => {
    setSubjects(subjects.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !formData.semester || !formData.sgpa) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const payload = {
        studentId: selectedStudent.id,
        semester: parseInt(formData.semester),
        academicYear: formData.academicYear,
        sgpa: parseFloat(formData.sgpa),
        cgpa: parseFloat(formData.cgpa || formData.sgpa),
        totalCredits: parseInt(formData.totalCredits || "0"),
        status: formData.status,
        resultDate: formData.resultDate,
        equivalentPercentage: parseFloat(formData.sgpa) * 9.5,
        subjects: subjects.filter((s) => s.name).map((s) => ({
          name: s.name,
          code: s.code,
          credits: parseInt(s.credits || "3"),
          grade: s.grade,
          marksObtained: parseInt(s.marksObtained || "0"),
          maxMarks: parseInt(s.maxMarks || "100"),
        })),
      };
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setSaveStatus("success");
      queryClient.invalidateQueries({ queryKey: ["all-results"] });
      setShowForm(false);
      setSelectedStudent(null);
      setStudentSearch("");
      setFormData({ semester: "", academicYear: "2024-25", sgpa: "", cgpa: "", totalCredits: "", status: "Pass", resultDate: new Date().toISOString().split("T")[0] });
      setSubjects([emptySubject()]);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredResults = (results ?? []).filter((r) => {
    const q = resultSearch.toLowerCase();
    return !q || r.studentName?.toLowerCase().includes(q) || r.enrollmentNo?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-500 text-sm mt-1">Enter semester results and SGPA for students</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1.5" /> Add Result</>}
        </Button>
      </div>

      {/* Save feedback */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4" /> Result saved successfully!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
          <XCircle className="w-4 h-4" /> Failed to save. Please try again.
        </div>
      )}

      {/* Add Result Form */}
      {showForm && (
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="border-b bg-blue-50 rounded-t-lg pb-3">
            <CardTitle className="text-base text-blue-900">New Result Entry</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {/* Student Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Select Student *</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search student by name or enrollment no."
                    className="pl-9"
                    value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.enrollmentNo || selectedStudent.id})` : studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setSelectedStudent(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  />
                </div>
                {showDropdown && studentSearch && !selectedStudent && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {studentsLoading ? (
                      <div className="p-3 text-sm text-gray-400">Loading…</div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400">No students found</div>
                    ) : (
                      filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          onMouseDown={() => {
                            setSelectedStudent(s);
                            setShowDropdown(false);
                          }}
                        >
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.enrollmentNo || `ID: ${s.id}`} {s.program ? `· ${s.program}` : ""}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedStudent && (
                <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium text-green-800">{selectedStudent.name}</span>
                    <span className="text-green-600 ml-2 text-xs">{selectedStudent.enrollmentNo || `ID: ${selectedStudent.id}`}</span>
                  </div>
                  <button onClick={() => { setSelectedStudent(null); setStudentSearch(""); }} className="text-gray-400 hover:text-red-500">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Semester Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Semester *</label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  placeholder="e.g. 3"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Academic Year</label>
                <Input
                  placeholder="2024-25"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">SGPA *</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  placeholder="e.g. 8.5"
                  value={formData.sgpa}
                  onChange={(e) => setFormData({ ...formData, sgpa: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">CGPA</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  placeholder="e.g. 8.2"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Total Credits</label>
                <Input
                  type="number"
                  placeholder="e.g. 24"
                  value={formData.totalCredits}
                  onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <select
                  className="w-full h-9 border border-gray-200 rounded-md px-3 text-sm bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Withheld">Withheld</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Result Date</label>
                <Input
                  type="date"
                  value={formData.resultDate}
                  onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Subjects</label>
                <Button size="sm" variant="outline" onClick={addSubject}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
                </Button>
              </div>
              <div className="space-y-2">
                {subjects.map((subj, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <Input
                      placeholder="Subject name"
                      className="col-span-2 text-xs"
                      value={subj.name}
                      onChange={(e) => updateSubject(i, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Code"
                      className="text-xs"
                      value={subj.code}
                      onChange={(e) => updateSubject(i, "code", e.target.value)}
                    />
                    <select
                      className="h-9 border border-gray-200 rounded-md px-2 text-xs bg-white"
                      value={subj.grade}
                      onChange={(e) => updateSubject(i, "grade", e.target.value)}
                    >
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <Input
                      placeholder="Marks"
                      className="text-xs"
                      value={subj.marksObtained}
                      onChange={(e) => updateSubject(i, "marksObtained", e.target.value)}
                    />
                    <div className="flex gap-1 items-center">
                      <Input
                        placeholder="Max"
                        className="text-xs"
                        value={subj.maxMarks}
                        onChange={(e) => updateSubject(i, "maxMarks", e.target.value)}
                      />
                      {subjects.length > 1 && (
                        <button onClick={() => removeSubject(i)} className="shrink-0 p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 px-1">Columns: Subject Name · Code · Grade · Marks · Max Marks</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleSubmit}
                disabled={!selectedStudent || !formData.semester || !formData.sgpa || saving}
              >
                {saving ? "Saving…" : "Save Result"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Submitted Results</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by student name…"
              className="pl-9 h-8 text-sm"
              value={resultSearch}
              onChange={(e) => setResultSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {resultsLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Sem</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Year</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">SGPA</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">CGPA</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.studentName || `Student ${r.studentId}`}</p>
                        <p className="text-xs text-gray-500">{r.enrollmentNo || `ID: ${r.studentId}`}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{r.semester}</td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{r.academicYear || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${r.sgpa >= 8.5 ? "text-emerald-600" : r.sgpa >= 6 ? "text-blue-600" : "text-red-600"}`}>
                          {r.sgpa?.toFixed(2) || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {r.cgpa?.toFixed(2) || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={
                          r.status?.toLowerCase() === "pass"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }>
                          {(r.status || "—").toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
