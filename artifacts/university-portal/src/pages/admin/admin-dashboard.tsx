import { useGetAdminDashboard, useListStudents, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, CreditCard, FileText, Bell, TrendingUp, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminDashboard();
  const { data: notifications } = useListNotifications();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Alliance University — System Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Students</p>
                <p className="text-3xl font-bold mt-1">{data.totalStudents}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full"><Users className="w-5 h-5 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Staff</p>
                <p className="text-3xl font-bold mt-1">{data.totalStaff}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full"><UserCheck className="w-5 h-5 text-purple-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">₹{(data.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-full"><CreditCard className="w-5 h-5 text-emerald-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Forms</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{data.pendingExamForms}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-full"><FileText className="w-5 h-5 text-amber-500" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Students by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {(data.departmentStats || []).map((dept) => {
              const pct = data.totalStudents > 0 ? (dept.studentCount / data.totalStudents) * 100 : 0;
              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate max-w-[70%]">{dept.department}</span>
                    <span className="font-semibold text-gray-900">{dept.studentCount} students</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" /> Recent Announcements
            </CardTitle>
            <Link href="/admin/notifications">
              <span className="text-sm text-primary hover:underline cursor-pointer">Manage</span>
            </Link>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="divide-y">
              {(notifications || []).slice(0, 5).map(n => (
                <div key={n.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      n.priority === "urgent" ? "bg-red-500" :
                      n.priority === "important" ? "bg-amber-500" : "bg-primary"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {n.targetRole} · {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${
                      n.priority === "urgent" ? "border-red-200 text-red-700" :
                      n.priority === "important" ? "border-amber-200 text-amber-700" : "border-blue-200 text-blue-700"
                    }`}>
                      {n.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Manage Students", href: "/admin/students", icon: <Users className="w-5 h-5" /> },
          { label: "Manage Staff", href: "/admin/staff", icon: <UserCheck className="w-5 h-5" /> },
          { label: "Fee Records", href: "/admin/fees", icon: <CreditCard className="w-5 h-5" /> },
          { label: "Exam Forms", href: "/admin/exam-forms", icon: <FileText className="w-5 h-5" /> },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5 flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-primary/10 rounded-full text-primary">{item.icon}</div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
