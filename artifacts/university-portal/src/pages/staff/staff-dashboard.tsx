import { useListStudents, useListExamForms, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Bell, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export function StaffDashboard() {
  const { user } = useAuth();
  const { data: students, isLoading: loadingStudents } = useListStudents();
  const { data: examForms, isLoading: loadingForms } = useListExamForms();
  const { data: notifications, isLoading: loadingNotifs } = useListNotifications({ targetRole: "staff" });

  const isLoading = loadingStudents || loadingForms || loadingNotifs;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const pendingForms = (examForms || []).filter(f => f.status === "pending");
  const approvedForms = (examForms || []).filter(f => f.status === "approved");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Staff Dashboard — Alliance University</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-4xl font-bold mt-1">{(students || []).length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full"><Users className="w-6 h-6 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Exam Forms</p>
              <p className="text-4xl font-bold mt-1 text-amber-600">{pendingForms.length}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-full"><Clock className="w-6 h-6 text-amber-500" /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved Forms</p>
              <p className="text-4xl font-bold mt-1 text-emerald-600">{approvedForms.length}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-full"><CheckCircle className="w-6 h-6 text-emerald-500" /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Forms Pending */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> Exam Forms for Review
            </CardTitle>
            <Link href="/staff/exam-forms">
              <span className="text-sm text-primary hover:underline cursor-pointer">View All</span>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {pendingForms.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No pending forms.</p>
            ) : (
              pendingForms.slice(0, 5).map(form => (
                <div key={form.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Student ID: {form.studentId} — Sem {form.semester}</p>
                    <p className="text-xs text-gray-500">{form.examType} · {form.academicYear}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" /> Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="divide-y">
              {(notifications || []).slice(0, 5).map(n => (
                <div key={n.id} className="p-4">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students list preview */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" /> Students
          </CardTitle>
          <Link href="/staff/students">
            <span className="text-sm text-primary hover:underline cursor-pointer">View All</span>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollment No</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Semester</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(students || []).slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">{s.enrollmentNo}</td>
                    <td className="px-5 py-3 text-gray-600">{s.department}</td>
                    <td className="px-5 py-3 text-center">{s.semester}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary">{s.cgpa?.toFixed(2) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
