import { useState, useRef } from "react";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, User, GraduationCap, ShieldCheck, Camera, PenLine, CheckCircle, Loader2, Edit2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function ProfilePage() {
  const { data, isLoading, isError } = useGetStudentDashboard();
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student } = data;
  const s = student as any;

  const uploadFile = async (file: File, field: "photoUrl" | "signatureUrl") => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch("/api/students/me/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ [field]: dataUrl }),
          });
          if (!res.ok) throw new Error("Upload failed");
          await queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          setSuccessMsg(field === "photoUrl" ? "Profile photo updated!" : "Signature updated!");
          setTimeout(() => setSuccessMsg(""), 3000);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try { await uploadFile(file, "photoUrl"); } finally { setUploadingPhoto(false); }
  };

  const handleSigChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSig(true);
    try { await uploadFile(file, "signatureUrl"); } finally { setUploadingSig(false); }
  };

  const openEditMode = () => {
    setFormData({
      name: student.name || "",
      phone: student.phone || "",
      email: student.email || "",
      address: s.address || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      dob: s.dob || "",
    });
    setEditMode(true);
    setErrorMsg("");
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/students/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Save failed");
      await queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditMode(false);
    } catch {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );

  const EditField = ({ label, field, type = "text" }: { label: string; field: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</Label>
      <Input
        type={type}
        value={formData[field] || ""}
        onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Personal and academic information</p>
        </div>
        {!editMode && (
          <Button variant="outline" onClick={openEditMode} className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />Edit Profile
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-4 py-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded px-4 py-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {/* Profile Header with Photo + Signature Upload */}
      <Card className="shadow-sm overflow-hidden">
        <div className="bg-[#0f1e3c] h-24" />
        <CardContent className="p-6 pt-0 -mt-12">
          <div className="flex items-end gap-5 flex-wrap">

            {/* Photo Upload */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                title="Change photo"
              >
                {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            <div className="pb-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-500 text-sm">{s.universityRegNo || student.enrollmentNo}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {s.bloodGroup && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Blood: {s.bloodGroup}</Badge>}
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Sem {student.semester}</Badge>
                {s.attendancePct && (
                  <Badge className={`hover:bg-green-100 ${s.attendancePct >= 75 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {s.attendancePct}% Attendance
                  </Badge>
                )}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="pb-2 flex flex-col items-center gap-1">
              <div
                className="border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                style={{ width: 140, height: 56 }}
                onClick={() => sigInputRef.current?.click()}
                title="Upload signature"
              >
                {(student as any).signatureUrl ? (
                  <img src={(student as any).signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 text-xs gap-1">
                    <PenLine className="w-4 h-4" />
                    <span>Upload Signature</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => sigInputRef.current?.click()}
                disabled={uploadingSig}
                className="text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-60"
              >
                {uploadingSig ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenLine className="w-3 h-3" />}
                {(student as any).signatureUrl ? "Change Signature" : "Upload Signature"}
              </button>
              <input ref={sigInputRef} type="file" accept="image/*" className="hidden" onChange={handleSigChange} />
              <p className="text-xs text-gray-400 text-center" style={{ maxWidth: 140 }}>
                Used in hall ticket & certificates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editMode && (
        <Card className="shadow-sm border-primary/40">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditField label="Full Name" field="name" />
              <EditField label="Phone Number" field="phone" type="tel" />
              <EditField label="Email Address" field="email" type="email" />
              <EditField label="Date of Birth" field="dob" type="date" />
              <EditField label="Father's Name" field="fatherName" />
              <EditField label="Mother's Name" field="motherName" />
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</Label>
                <Input
                  value={formData.address || ""}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="Full address..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                <X className="w-4 h-4 mr-2" />Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#8b0000] hover:bg-[#6b0000]">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <InfoRow label="Enrollment No." value={student.enrollmentNo} />
            <InfoRow label="Roll No." value={student.rollNo} />
            <InfoRow label="Admission No." value={student.admissionNo} />
            <InfoRow label="University Regn. No." value={s.universityRegNo} />
            <InfoRow label="Program" value={student.program} />
            <InfoRow label="Department" value={student.department} />
            <InfoRow label="Semester" value={`${student.semester}`} />
            <InfoRow label="Section" value={student.section} />
            <InfoRow label="Academic Year" value={student.academicYear} />
            <InfoRow label="CGPA" value={student.cgpa ? student.cgpa.toFixed(2) : null} />
            <InfoRow label="SGPA" value={s.sgpa ? s.sgpa.toFixed(2) : null} />
            {s.attendancePct && <InfoRow label="Attendance" value={`${s.attendancePct}%`} />}
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <InfoRow label="Full Name" value={student.name} />
            <InfoRow label="Date of Birth" value={student.dob ? (() => { try { return format(new Date(student.dob), "dd MMMM yyyy"); } catch { return student.dob; } })() : null} />
            <InfoRow label="Blood Group" value={s.bloodGroup} />
            <InfoRow label="Category" value={s.category} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Father's Name" value={student.fatherName} />
            <InfoRow label="Mother's Name" value={student.motherName} />
            <InfoRow label="Address" value={s.address} />
          </CardContent>
        </Card>
      </div>

      {/* Identity Info */}
      {(s.aadhaarNo || s.universityRegNo) && (
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Identity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <InfoRow label="University Regn. No." value={s.universityRegNo} />
            <InfoRow label="Aadhaar No." value={s.aadhaarNo} />
            <InfoRow label="Category" value={s.category} />
            <InfoRow label="Blood Group" value={s.bloodGroup} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
