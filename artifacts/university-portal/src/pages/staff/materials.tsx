import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Upload, Trash2, Download, Plus, FileText, Loader2 } from "lucide-react";

interface Material {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  type: string;
  fileName: string | null;
  contentType: string | null;
  createdAt: string;
}

async function fetchMaterials(): Promise<Material[]> {
  const r = await fetch("/api/materials", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to fetch");
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

const TYPE_LABELS: Record<string, string> = {
  notes: "Notes",
  assignment: "Assignment",
  resource: "Resource",
};

const TYPE_COLORS: Record<string, string> = {
  notes: "bg-blue-100 text-blue-800",
  assignment: "bg-orange-100 text-orange-800",
  resource: "bg-green-100 text-green-800",
};

export function StaffMaterialsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", type: "notes", description: "", fileName: "", fileData: "", contentType: "" });
  const [uploading, setUploading] = useState(false);

  const { data: materials, isLoading } = useQuery({ queryKey: ["materials"], queryFn: fetchMaterials });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const r = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to upload");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      setOpen(false);
      setForm({ title: "", subject: "", type: "notes", description: "", fileName: "", fileData: "", contentType: "" });
      toast({ title: "Material uploaded", description: "File has been added successfully." });
    },
    onError: () => toast({ title: "Error", description: "Upload failed.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/materials/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const b64 = await toBase64(file);
      setForm(f => ({ ...f, fileName: file.name, fileData: b64, contentType: file.type }));
    } finally {
      setUploading(false);
    }
  };

  const grouped = (materials || []).reduce<Record<string, Material[]>>((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes & Materials</h1>
          <p className="text-gray-500 mt-1">Upload study materials, assignments, and resources for students</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Upload Material
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (materials || []).length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No materials uploaded yet</p>
            <p className="text-sm mt-1">Click "Upload Material" to add notes, assignments, or resources</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([subject, items]) => (
          <Card key={subject} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {subject}
                <Badge variant="outline" className="ml-auto">{items.length} file{items.length !== 1 ? "s" : ""}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {items.map(m => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{m.title}</p>
                    {m.description && <p className="text-xs text-gray-500 truncate">{m.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{m.fileName} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[m.type] || "bg-gray-100 text-gray-700"}`}>
                    {TYPE_LABELS[m.type] || m.type}
                  </span>
                  <a href={`/api/materials/${m.id}/file`} download={m.fileName || "file"} className="p-1.5 text-gray-400 hover:text-primary">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => deleteMutation.mutate(m.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 3 Notes" />
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics, Physics" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="space-y-1.5">
              <Label>File *</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {form.fileName ? (
                  <div className="flex items-center gap-2 justify-center text-sm text-gray-700">
                    <FileText className="w-4 h-4 text-primary" />
                    {form.fileName}
                  </div>
                ) : uploading ? (
                  <div className="flex items-center gap-2 justify-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    Click to upload PDF, image, or document
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                className="flex-1"
                disabled={!form.title || !form.subject || !form.fileData || addMutation.isPending}
                onClick={() => addMutation.mutate(form)}
              >
                {addMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
