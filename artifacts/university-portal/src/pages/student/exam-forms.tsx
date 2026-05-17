import { useGetMyExamForms } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export function ExamFormsPage() {
  const { data, isLoading, isError } = useGetMyExamForms();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load exam forms.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-amber-600" />;
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Forms</h1>
          <p className="text-gray-500 mt-1">View and manage your exam form submissions</p>
        </div>
      </div>

      {/* Info card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex gap-3 items-start">
          <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Important Information</p>
            <ul className="space-y-1 list-disc list-inside text-gray-600">
              <li>Exam forms must be submitted before the deadline to appear in examinations</li>
              <li>Ensure all pending fees are cleared before submitting exam forms</li>
              <li>Once approved, your hall ticket will be generated automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {data.length === 0 ? (
        <Card>
          <CardContent className="pt-8 py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No exam forms found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((form) => {
            let subjects: string[] = [];
            try { subjects = JSON.parse(typeof form.subjects === 'string' ? form.subjects : JSON.stringify(form.subjects)); } catch { subjects = []; }
            return (
              <Card key={form.id} className="shadow-sm">
                <CardHeader className="pb-4 border-b flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {statusIcon(form.status)}
                      Semester {form.semester} — {form.examType}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Academic Year: {form.academicYear}</p>
                  </div>
                  {statusBadge(form.status)}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects</p>
                      <div className="space-y-2">
                        {subjects.map((subject, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {subject}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Submitted on</span>
                            <span className="font-medium">
                              {form.submittedAt ? format(new Date(form.submittedAt), "dd MMM yyyy") : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="font-medium capitalize">{form.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subjects count</span>
                            <span className="font-medium">{subjects.length}</span>
                          </div>
                        </div>
                      </div>
                      {form.status === "approved" && (
                        <Link href="/student/hall-ticket">
                          <Button size="sm" variant="outline" className="w-full mt-2">
                            View Hall Ticket
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
