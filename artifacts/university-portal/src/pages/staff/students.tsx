import { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Pencil, X, Check, Loader2, GraduationCap, Phone, Mail, MapPin, User } from "lucide-react";
import { format } from "date-fns";

type Student = {
  id: number;
  name: string;
  enrollmentNo: string;
  rollNo: string;
  admissionNo?: string | null;
  program: string;
  department: string;
  semester: number;
  section?: string | null;
  academicYear?: string | null;
  email: string;
  phone?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  dob?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  universityRegNo?: string | null;
  bloodGroup?: string | null;
  category?: string | null;
  cgpa?: number | null;
  sgpa?: number | null;
  attendancePct?: number | null;
};

async function updateStudent(id: number, data: Partial<Student>) {
  const res = await fetch(`/api/students/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold">{value ?? "—"}</span>
    </div>
  );
}

export function StaffStudentsPage() {
  const queryClient = useQueryClient();
  const { data: students, isLoading } = useListStudents();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) => updateStudent(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setSelected(updated);
      setEditing(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    },
  });

  const filtered = (students as Student[] || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = (s: Student) => {
    setSelected(s);
    setEditing(false);
    setEditData({});
    setSaveStatus("idle");
  };

  const startEdit = () => {
    if (!selected) return;
    setEditData({
      name: selected.name,
      email: selected.email,
      phone: selected.phone ?? "",
      fatherName: selected.fatherName ?? "",
      motherName: selected.motherName ?? "",
      dob: selected.dob ?? "",
      address: selected.address ?? "",
      bloodGroup: selected.bloodGroup ?? "",
      category: selected.category ?? "",
      program: selected.program,
      department: selected.department,
      semester: selected.semester,
      section: selected.section ?? "",
      academicYear: selected.academicYear ?? "",
      cgpa: selected.cgpa ?? undefined,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    setSaveStatus("saving");
    mutation.mutate({ id: selected.id, data: editData });
  };

  const field = (key: keyof Student, label: string, type: string = "text") => (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">{label}</Label>
      <Input
        type={type}
        value={String(editData[key] ?? "")}
        onChange={e => setEditData(d => ({ ...d, [key]: type === "number" ? parseFloat(e.target.value) : e.target.value }))}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">View and manage student records — click a name to see full details</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, enrollment no, department..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} students</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sem</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Section</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                        <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(s)}>
                        <td className="px-5 py-3 font-medium text-primary hover:underline">{s.name}</td>
                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{s.enrollmentNo}</td>
                        <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{s.program}</td>
                        <td className="px-5 py-3 text-gray-600">{s.department}</td>
                        <td className="px-5 py-3 text-center">{s.semester}</td>
                        <td className="px-5 py-3 text-center">{s.section || "—"}</td>
                        <td className="px-5 py-3 text-right font-semibold text-primary">{s.cgpa?.toFixed(2) || "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail + Edit Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) { setSelected(null); setEditing(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selected?.photoUrl ? (
                <img src={selected.photoUrl} alt={selected.name} className="w-10 h-10 rounded-full object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <span>{editing ? "Edit Student" : selected?.name}</span>
              {!editing && selected && (
                <Badge variant="outline" className="ml-auto text-xs">Sem {selected.semester}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && !editing && (
            <div className="space-y-5 py-2">
              {/* Academic Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Academic Information
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-4">
                  <InfoRow label="Enrollment No." value={selected.enrollmentNo} />
                  <InfoRow label="Roll No." value={selected.rollNo} />
                  <InfoRow label="Admission No." value={selected.admissionNo} />
                  <InfoRow label="Univ. Reg. No." value={selected.universityRegNo} />
                  <InfoRow label="Program" value={selected.program} />
                  <InfoRow label="Department" value={selected.department} />
                  <InfoRow label="Semester" value={selected.semester} />
                  <InfoRow label="Section" value={selected.section} />
                  <InfoRow label="Academic Year" value={selected.academicYear} />
                  <InfoRow label="CGPA" value={selected.cgpa?.toFixed(2)} />
                  <InfoRow label="SGPA" value={selected.sgpa?.toFixed(2)} />
                  <InfoRow label="Attendance" value={selected.attendancePct ? `${selected.attendancePct}%` : undefined} />
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Personal Information
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-4">
                  <InfoRow label="Father's Name" value={selected.fatherName} />
                  <InfoRow label="Mother's Name" value={selected.motherName} />
                  <InfoRow label="Date of Birth" value={selected.dob ? (() => { try { return format(new Date(selected.dob!), "dd MMM yyyy"); } catch { return selected.dob!; } })() : undefined} />
                  <InfoRow label="Blood Group" value={selected.bloodGroup} />
                  <InfoRow label="Category" value={selected.category} />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-4">
                  <InfoRow label={<><Mail className="w-3 h-3 inline mr-1" />Email</>  as unknown as string} value={selected.email} />
                  <InfoRow label={<><Phone className="w-3 h-3 inline mr-1" />Phone</>  as unknown as string} value={selected.phone} />
                  <div className="col-span-2 flex gap-2 text-sm">
                    <span className="w-36 shrink-0 text-gray-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />Address</span>
                    <span className="text-gray-900 font-semibold">{selected.address ?? "—"}</span>
                  </div>
                </div>
              </div>

              {saveStatus === "success" && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
                  <Check className="w-4 h-4" /> Student updated successfully
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <Button onClick={startEdit} className="bg-primary hover:bg-primary/90">
                  <Pencil className="w-4 h-4 mr-2" /> Edit Student
                </Button>
              </div>
            </div>
          )}

          {selected && editing && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-3">
                {field("name", "Full Name")}
                {field("email", "Email", "email")}
                {field("phone", "Phone")}
                {field("fatherName", "Father's Name")}
                {field("motherName", "Mother's Name")}
                {field("dob", "Date of Birth", "date")}
                {field("bloodGroup", "Blood Group")}
                {field("category", "Category")}
                {field("program", "Program")}
                {field("department", "Department")}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Semester</Label>
                  <Input
                    type="number" min={1} max={8}
                    value={String(editData.semester ?? "")}
                    onChange={e => setEditData(d => ({ ...d, semester: parseInt(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
                {field("section", "Section")}
                {field("academicYear", "Academic Year")}
                {field("cgpa", "CGPA", "number")}
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-gray-600">Address</Label>
                <Input
                  value={String(editData.address ?? "")}
                  onChange={e => setEditData(d => ({ ...d, address: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>

              {saveStatus === "error" && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
                  <X className="w-4 h-4" /> Failed to save. Please try again.
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saveStatus === "saving"}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving"
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    : <><Check className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
