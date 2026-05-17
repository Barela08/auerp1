import { useListExamForms } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getListExamFormsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

async function updateExamFormStatus(id: number, status: string) {
  const res = await fetch(`/api/exam-forms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function AdminExamFormsPage() {
  const { data, isLoading } = useListExamForms();
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateExamFormStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExamFormsQueryKey() }),
  });

  const forms = Array.isArray(data) ? data : [];

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exam Form Management</h1>
        <p className="text-gray-500 mt-1">Review and manage all exam form submissions</p>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student ID</th>
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
                        <td className="px-4 py-3 font-medium">#{f.studentId}</td>
                        <td className="px-4 py-3">Semester {f.semester}</td>
                        <td className="px-4 py-3 text-gray-600">{f.examType}</td>
                        <td className="px-4 py-3 text-gray-600">{f.academicYear}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {f.submittedAt ? format(new Date(f.submittedAt), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">{statusBadge(f.status)}</td>
                        <td className="px-4 py-3">
                          {f.status === "pending" ? (
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                                onClick={() => update.mutate({ id: f.id, status: "approved" })}
                                disabled={update.isPending}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 h-7 px-2 text-xs"
                                onClick={() => update.mutate({ id: f.id, status: "rejected" })}
                                disabled={update.isPending}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs text-center block">Processed</span>
                          )}
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
    </div>
  );
}
