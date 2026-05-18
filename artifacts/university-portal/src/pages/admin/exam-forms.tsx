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
import { FileText, CheckCircle, XCircle, AlertCircle, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";

async function updateExamFormStatus(id: number, status: string, remarks?: string) {
  const res = await fetch(`/api/exam-forms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, remarks: remarks || null }),
  });
  if (!res.ok) throw new Error("Failed");
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

export function AdminExamFormsPage() {
  const { data, isLoading } = useListExamForms();
  const queryClient = useQueryClient();

  const [rejectDialog, setRejectDialog] = useState<{ id: number; studentName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [detailForm, setDetailForm] = useState<ExamForm | null>(null);

  const update = useMutation({
    mutationFn: ({ id, status, remarks }: { id: number; status: string; remarks?: string }) =>
      updateExamFormStatus(id, status, remarks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExamFormsQueryKey() }),
  });

  const forms = (Array.isArray(data) ? data : []) as ExamForm[];

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
  };

  const handleApprove = (id: number) => {
    update.mutate({ id, status: "approved" });
  };

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

  const pending = forms.filter(f => f.status === "pending");
  const approved = forms.filter(f => f.status === "approved");
  const rejected = forms.filter(f => f.status === "rejected");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exam Form Management</h1>
        <p className="text-gray-500 mt-1">Review and manage all exam form submissions</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-400">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">{approved.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-400">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{rejected.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Semester</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No exam forms
                      </td>
                    </tr>
                  ) : (
                    forms.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div>{f.studentName || `Student #${f.studentId}`}</div>
                          <div className="text-xs text-gray-400">ID: {f.studentId}</div>
                        </td>
                        <td className="px-4 py-3">Semester {f.semester}</td>
                        <td className="px-4 py-3 text-gray-600">{f.examType}</td>
                        <td className="px-4 py-3 text-gray-600">{f.academicYear}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {f.submittedAt ? format(new Date(f.submittedAt), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {statusBadge(f.status)}
                            {f.status === "rejected" && f.remarks && (
                              <span className="text-[10px] text-red-500 max-w-[120px] text-center leading-tight">
                                {f.remarks.length > 40 ? f.remarks.slice(0, 40) + "…" : f.remarks}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                              onClick={() => setDetailForm(f)}
                            >
                              <Eye className="w-3 h-3 mr-1" />View
                            </Button>
                            {f.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                                  onClick={() => handleApprove(f.id)}
                                  disabled={update.isPending}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 h-7 px-2 text-xs hover:bg-red-50"
                                  onClick={() => openReject(f)}
                                  disabled={update.isPending}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />Reject
                                </Button>
                              </>
                            )}
                          </div>
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
              Rejecting form for <strong>{rejectDialog?.studentName}</strong>. A reason is mandatory and will be shown to the student.
            </p>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Rejection Reason <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="e.g. Fee dues not cleared, attendance shortage below 75%..."
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

      {/* Detail View Dialog */}
      <Dialog open={!!detailForm} onOpenChange={open => { if (!open) setDetailForm(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Exam Form Details</DialogTitle>
          </DialogHeader>
          {detailForm && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Student:</span> <span className="font-medium">{detailForm.studentName || `#${detailForm.studentId}`}</span></div>
                <div><span className="text-gray-500">Semester:</span> <span className="font-medium">{detailForm.semester}</span></div>
                <div><span className="text-gray-500">Exam Type:</span> <span className="font-medium">{detailForm.examType}</span></div>
                <div><span className="text-gray-500">Academic Year:</span> <span className="font-medium">{detailForm.academicYear}</span></div>
                <div><span className="text-gray-500">Status:</span> {statusBadge(detailForm.status)}</div>
                <div><span className="text-gray-500">Submitted:</span> <span className="font-medium">{detailForm.submittedAt ? format(new Date(detailForm.submittedAt), "dd MMM yyyy") : "—"}</span></div>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-2">Subjects:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(detailForm.subjects || []).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
              {detailForm.status === "rejected" && detailForm.remarks && (
                <div className="bg-red-50 border border-red-100 rounded p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{detailForm.remarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailForm(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
