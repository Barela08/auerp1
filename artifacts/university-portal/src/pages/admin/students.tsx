import { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Edit2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type StudentRow = {
  id: number;
  name: string;
  enrollmentNo: string;
  rollNo?: string;
  admissionNo?: string;
  universityRegNo?: string;
  department: string;
  program: string;
  semester: number;
  section?: string;
  academicYear?: string;
  cgpa?: number;
  email: string;
  phone: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  address?: string;
  bloodGroup?: string;
  category?: string;
};

export function AdminStudentsPage() {
  const { data: students, isLoading } = useListStudents();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
  const [formData, setFormData] = useState<Partial<StudentRow>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = (students || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.program.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s: StudentRow) => {
    setEditStudent(s);
    setFormData({ ...s });
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!editStudent) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/students/${editStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update student");
      await queryClient.invalidateQueries({ queryKey: ["listStudents"] });
      setSuccessMsg(`${formData.name || editStudent.name}'s details updated!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditStudent(null);
    } catch {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const F = ({ label, field, type = "text" }: { label: string; field: keyof StudentRow; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</Label>
      <Input
        type={type}
        value={(formData[field] as string) || ""}
        onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-500 mt-1">All enrolled students — click Edit to update details</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-4 py-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{filtered.length} of {(students || []).length} students</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program / Dept</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sem</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div>{s.name}</div>
                          <div className="text-xs text-gray-400">{s.fatherName ? `Father: ${s.fatherName}` : ""}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.enrollmentNo}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-700 max-w-[180px]">{s.department}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{s.program}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{s.semester}</td>
                        <td className="px-4 py-3 text-center">{s.section || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.academicYear || "—"}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{s.cgpa?.toFixed(2) || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">{s.email}</div>
                          <div className="text-xs text-gray-400">{s.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => openEdit(s as StudentRow)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={open => { if (!open) setEditStudent(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Student — {editStudent?.name}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <F label="Full Name" field="name" />
            <F label="Phone" field="phone" type="tel" />
            <F label="Email" field="email" type="email" />
            <F label="Date of Birth" field="dob" type="date" />
            <F label="Father's Name" field="fatherName" />
            <F label="Mother's Name" field="motherName" />
            <F label="Enrollment No." field="enrollmentNo" />
            <F label="Roll No." field="rollNo" />
            <F label="Admission No." field="admissionNo" />
            <F label="University Reg. No." field="universityRegNo" />
            <F label="Program" field="program" />
            <F label="Department" field="department" />
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</Label>
              <Input
                type="number"
                min={1} max={8}
                value={(formData.semester as number) || ""}
                onChange={e => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) || 1 }))}
                className="h-9 text-sm"
              />
            </div>
            <F label="Section" field="section" />
            <F label="Academic Year" field="academicYear" />
            <F label="Blood Group" field="bloodGroup" />
            <F label="Category" field="category" />
            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</Label>
              <Input
                value={(formData.address as string) || ""}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="h-9 text-sm"
                placeholder="Full address..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#8b0000] hover:bg-[#6b0000]">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
