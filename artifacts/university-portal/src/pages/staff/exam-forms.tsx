import { useState } from "react";
import { useListExamForms } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getListExamFormsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

async function updateExamFormStatus(id: number, status: string, remarks?: string) {
  const res = await fetch(`/api/exam-forms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, remarks: remarks || null }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

type ExamForm = {
  id: number;
  studentId: number;
  studentName?: string | null;
  semester: number;
  examType: string;
  academicYear: string;
  status: string;
  subjects: string[];
  remarks?: string | null;
  submittedAt?: string;
};

export function StaffExamFormsPage() {
  const { data, isLoading } = useListExamForms();
  const queryClient = useQueryClient();

  const [rejectDialog, setRejectDialog] = useState<{ id: number; studentName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const update = useMutation({
    mutationFn: ({ id, status, remarks }: { id: number; status: string; remarks?: string }) =>
      updateExamFormStatus(id, status, remarks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExamFormsQueryKey() }),
  });

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
  };

  const forms = (Array.isArray(data) ? data : []) as ExamForm[];
  const pending = forms.filter(f => f.status === "pending");
  const processed = forms.filter(f => f.status !== "pending");

  const openReject = (form: ExamForm) => {
    setRejectDialog({ id: form.id, studentName: form.studentName || `Student #${form.studentId}` });
    setRejectReason("");
    setRejectError("");
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }
    if (!rejectDialog) return;
    update.mutate({ id: rejectDialog.id, status: "rejected", remarks: rejectReason.trim() });
    setRejectDialog(null);
    setRejectReason("");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exam Form Management</h1>
        <p className="text-gray-500 mt-1">Review and approve student exam form submissions</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending Review ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(form => (
                  <Card key={form.id} className="shadow-sm border-l-4 border-l-amber-400">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {form.studentName || `Student #${form.studentId}`}
                            </p>
                            {statusBadge(form.status)}
                          </div>
                          <p className="text-sm text-gray-600">Semester {form.semester} — {form.examType} · {form.academicYear}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Submitted: {form.submittedAt ? format(new Date(form.submittedAt), "dd MMM yyyy") : "—"}</p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(form.subjects || []).map((s, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => update.mutate({ id: form.id, status: "approved" })}
                            disabled={update.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => openReject(form)}
                            disabled={update.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {processed.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Processed ({processed.length})</h2>
              <div className="space-y-2">
                {processed.map(form => (
                  <Card key={form.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {form.studentName || `Student #${form.studentId}`} — Semester {form.semester} — {form.examType}
                          </p>
                          <p className="text-xs text-gray-500">{form.academicYear} · Submitted: {form.submittedAt ? format(new Date(form.submittedAt), "dd MMM yyyy") : "—"}</p>
                          {form.status === "rejected" && form.remarks && (
                            <div className="mt-2 bg-red-50 border border-red-100 rounded px-3 py-2">
                              <p className="text-xs font-semibold text-red-600">Rejection Reason:</p>
                              <p className="text-xs text-red-500 mt-0.5">{form.remarks}</p>
                            </div>
                          )}
                        </div>
                        {statusBadge(form.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {forms.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No exam forms submitted yet.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={open => { if (!open) setRejectDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> Reject Exam Form
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-gray-600">
              Rejecting form for <strong>{rejectDialog?.studentName}</strong>. A reason is mandatory and will be visible to the student.
            </p>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Attendance below 75%, fee dues not cleared..."
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setRejectError(""); }}
                className="min-h-[100px] text-sm"
              />
              {rejectError && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />{rejectError}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button
              onClick={submitReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={update.isPending}
            >
              {update.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
