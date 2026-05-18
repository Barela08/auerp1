import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, PenLine, Save, Loader2 } from "lucide-react";

interface StaffProfile {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  signatureUrl: string | null;
}

async function fetchMyProfile(): Promise<StaffProfile> {
  const r = await fetch("/api/staff/me", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to fetch profile");
  return r.json();
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export function StaffProfilePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const photoRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({ queryKey: ["staff-me"], queryFn: fetchMyProfile });

  const [form, setForm] = useState<Partial<StaffProfile>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<StaffProfile>) => {
      const r = await fetch("/api/staff/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to save");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-me"] });
      setForm({});
      setPhotoPreview(null);
      setSigPreview(null);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: () => toast({ title: "Error", description: "Could not save profile.", variant: "destructive" }),
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setPhotoPreview(b64);
    setForm(f => ({ ...f, photoUrl: b64 }));
  };

  const handleSigChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setSigPreview(b64);
    setForm(f => ({ ...f, signatureUrl: b64 }));
  };

  const handleSave = () => {
    if (Object.keys(form).length === 0) return;
    saveMutation.mutate(form);
  };

  if (isLoading) return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  const p = profile!;
  const currentPhoto = photoPreview ?? p.photoUrl;
  const currentSig = sigPreview ?? p.signatureUrl;

  const field = (key: keyof StaffProfile, label: string, readOnly = false) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={(form[key] as string) ?? (p[key] as string) ?? ""}
        onChange={e => !readOnly && setForm(f => ({ ...f, [key]: e.target.value }))}
        readOnly={readOnly}
        className={readOnly ? "bg-gray-50 text-gray-500" : ""}
      />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Update your profile photo, signature and personal details</p>
      </div>

      {/* Photo & Signature */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Photo & Signature</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-8">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors bg-gray-50"
              onClick={() => photoRef.current?.click()}
            >
              {currentPhoto ? (
                <img src={currentPhoto} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <button
              onClick={() => photoRef.current?.click()}
              className="text-xs flex items-center gap-1 text-primary hover:underline"
            >
              <Camera className="w-3 h-3" /> Change Photo
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Signature */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              style={{ width: 160, height: 64 }}
              onClick={() => sigRef.current?.click()}
            >
              {currentSig ? (
                <img src={currentSig} alt="Signature" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 text-xs gap-1">
                  <PenLine className="w-4 h-4" />
                  <span>Upload Signature</span>
                </div>
              )}
            </div>
            <button
              onClick={() => sigRef.current?.click()}
              className="text-xs flex items-center gap-1 text-primary hover:underline"
            >
              <PenLine className="w-3 h-3" /> Change Signature
            </button>
            <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleSigChange} />
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("name", "Full Name")}
          {field("employeeId", "Employee ID", true)}
          {field("email", "Email")}
          {field("phone", "Phone")}
          {field("department", "Department")}
          {field("designation", "Designation")}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saveMutation.isPending || Object.keys(form).length === 0} className="w-full md:w-auto">
        {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
      </Button>
    </div>
  );
}
