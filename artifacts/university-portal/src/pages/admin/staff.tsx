import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import {
  UserCheck, Search, Edit2, CheckCircle, AlertCircle, Loader2, Camera
} from "lucide-react";

type StaffRow = {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AdminStaffPage() {
  const { data: staff, isLoading } = useListStaff();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editStaff, setEditStaff] = useState<StaffRow | null>(null);
  const [formData, setFormData] = useState<Partial<StaffRow>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = (staff || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase())
  );

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const openEdit = (s: StaffRow) => {
    setEditStaff(s);
    setFormData({ ...s });
  };

  const handleSave = async () => {
    if (!editStaff) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${editStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await queryClient.invalidateQueries({ queryKey: ["listStaff"] });
      showMsg("success", `${formData.name}'s details updated!`);
      setEditStaff(null);
    } catch {
      showMsg("error", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!editStaff) return;
    const data = await toBase64(file);
    const res = await fetch(`/api/staff/${editStaff.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ photoUrl: data }),
    });
    if (!res.ok) throw new Error("Photo upload failed");
    setFormData(prev => ({ ...prev, photoUrl: data }));
    setEditStaff(prev => prev ? { ...prev, photoUrl: data } : prev);
    await queryClient.invalidateQueries({ queryKey: ["listStaff"] });
  };

  const handlePhotoDelete = async () => {
    if (!editStaff) return;
    await fetch(`/api/staff/${editStaff.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ photoUrl: null }),
    });
    setFormData(prev => ({ ...prev, photoUrl: null }));
    setEditStaff(prev => prev ? { ...prev, photoUrl: null } : prev);
  };

  const F = ({ label, field, type = "text" }: { label: string; field: keyof StaffRow; type?: string }) => (
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-500 mt-1">Faculty and administrative staff directory</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium border ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search staff..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{filtered.length} staff members</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Photo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Designation</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No staff found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          {(s as StaffRow).photoUrl ? (
                            <img
                              src={(s as StaffRow).photoUrl!}
                              alt={s.name}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center">
                              <Camera className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{s.employeeId}</td>
                        <td className="px-5 py-3 text-gray-700">{s.designation}</td>
                        <td className="px-5 py-3 text-gray-600">{s.department}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
                        <td className="px-5 py-3 text-gray-500">{s.phone}</td>
                        <td className="px-5 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => openEdit(s as StaffRow)}
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

      {/* Edit Staff Dialog */}
      <Dialog open={!!editStaff} onOpenChange={open => { if (!open) setEditStaff(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Staff — {editStaff?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Photo Upload */}
          <div className="space-y-1.5 pb-3 border-b border-gray-100">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Staff Photo
            </Label>
            <FileUploadZone
              accept="image/png,image/jpeg,image/webp"
              currentUrl={formData.photoUrl ?? undefined}
              currentContentType={formData.photoUrl ? "image/jpeg" : undefined}
              onUpload={handlePhotoUpload}
              onDelete={formData.photoUrl ? handlePhotoDelete : undefined}
              maxSizeMB={5}
              compact
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <F label="Full Name" field="name" />
            <F label="Employee ID" field="employeeId" />
            <F label="Email" field="email" type="email" />
            <F label="Phone" field="phone" type="tel" />
            <F label="Department" field="department" />
            <F label="Designation" field="designation" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaff(null)} disabled={saving}>
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
