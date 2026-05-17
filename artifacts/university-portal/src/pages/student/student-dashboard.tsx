import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "wouter";
import { 
  GraduationCap, Calendar, CreditCard, Bell, 
  FileText, ArrowRight, Download, AlertTriangle
} from "lucide-react";

export function StudentDashboard() {
  const { data: dashboard, isLoading, isError } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="font-medium">Failed to load dashboard data.</p>
            <p className="text-sm opacity-80 mt-1">Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, feeSummary, attendanceSummary, recentNotifications, upcomingExams, recentResults, pendingExamForms } = dashboard;

  // Calculate overall attendance percentage
  const totalClasses = attendanceSummary?.reduce((acc, curr) => acc + curr.totalClasses, 0) || 0;
  const attendedClasses = attendanceSummary?.reduce((acc, curr) => acc + curr.attendedClasses, 0) || 0;
  const overallAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Profile Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {student.name.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">
            {student.program} • Semester {student.semester} • {student.enrollmentNo}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1">
            Academic Year {student.academicYear || "2024-25"}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm hover-elevate">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Current CGPA</p>
                <p className="text-4xl font-bold tracking-tight text-gray-900">
                  {student.cgpa ? student.cgpa.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            {recentResults?.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-gray-500">Last Semester SGPA</span>
                <span className="font-semibold text-gray-900">{recentResults[0].sgpa.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover-elevate">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold tracking-tight text-gray-900">{overallAttendance.toFixed(1)}%</p>
                </div>
                <Progress value={overallAttendance} className="h-2 mt-3" />
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600 ml-4 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Classes</span>
              <span className="font-semibold text-gray-900">{attendedClasses} / {totalClasses}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm hover-elevate ${feeSummary?.pendingAmount > 0 ? 'border-l-destructive' : 'border-l-emerald-500'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Fees Due</p>
                <p className="text-4xl font-bold tracking-tight text-gray-900">
                  ₹{feeSummary?.pendingAmount?.toLocaleString() || "0"}
                </p>
              </div>
              <div className={`p-3 rounded-full shrink-0 ${feeSummary?.pendingAmount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Fees</span>
              <span className="font-semibold text-gray-900">₹{feeSummary?.totalFees?.toLocaleString() || "0"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Attendance Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">Subject Attendance</CardTitle>
                <CardDescription>Current semester progress</CardDescription>
              </div>
              <Link href="/student/attendance">
                <Button variant="ghost" size="sm" className="text-primary">
                  View Details <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {attendanceSummary?.length > 0 ? (
                attendanceSummary.map((subject) => (
                  <div key={subject.subjectId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{subject.subjectName}</span>
                      <span className="font-semibold">{subject.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={subject.percentage} className={`h-2 ${subject.percentage < 75 ? '[&>div]:bg-destructive' : '[&>div]:bg-emerald-500'}`} />
                    <p className="text-xs text-gray-500 text-right">
                      {subject.attendedClasses} / {subject.totalClasses} classes
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No attendance records found.</p>
              )}
            </CardContent>
          </Card>

          {/* Fee Records */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">Fee History</CardTitle>
                <CardDescription>Recent transactions</CardDescription>
              </div>
              <Link href="/student/fees">
                <Button variant="ghost" size="sm" className="text-primary">
                  All Records <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y">
                {feeSummary?.records?.length > 0 ? (
                  feeSummary.records.slice(0, 3).map((fee) => (
                    <div key={fee.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${fee.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : fee.status === 'partial' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Semester {fee.semester} Fee</p>
                          <p className="text-xs text-gray-500">Due: {format(new Date(fee.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{fee.totalFees.toLocaleString()}</p>
                        {fee.status === 'paid' && fee.receiptNo && (
                          <Link href={`/student/fees/${fee.id}/receipt`}>
                            <span className="text-xs text-primary flex items-center justify-end gap-1 mt-1 hover:underline cursor-pointer">
                              <Download className="w-3 h-3" /> Receipt
                            </span>
                          </Link>
                        )}
                        {fee.status !== 'paid' && (
                          <Badge variant="outline" className="mt-1 text-[10px] text-destructive border-destructive/20 bg-destructive/5">
                            Pending: ₹{fee.pendingAmount.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6">No fee records found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-8">
          
          {/* Action Alerts */}
          {((pendingExamForms ?? 0) > 0 || feeSummary?.pendingAmount > 0) && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feeSummary?.pendingAmount > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Fees</p>
                      <p className="text-xs text-gray-500">Clear dues before exams</p>
                    </div>
                    <Link href="/student/fees">
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50">
                        Pay Now
                      </Button>
                    </Link>
                  </div>
                )}
                {(pendingExamForms ?? 0) > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Exam Forms</p>
                      <p className="text-xs text-gray-500">Submission pending</p>
                    </div>
                    <Link href="/student/exam-forms">
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50">
                        Submit
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <Bell className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="divide-y">
                {recentNotifications?.length > 0 ? (
                  recentNotifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                          notification.priority === 'urgent' ? 'bg-red-500' :
                          notification.priority === 'important' ? 'bg-amber-500' : 'bg-primary'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight mb-1">{notification.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6 text-sm">No new notifications</p>
                )}
              </div>
              {recentNotifications?.length > 4 && (
                <div className="p-3 border-t text-center">
                  <Link href="/student/notifications">
                    <span className="text-sm text-primary font-medium hover:underline cursor-pointer">
                      View All Notifications
                    </span>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-lg">Upcoming Exams & Events</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {upcomingExams?.length > 0 ? (
                  upcomingExams.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="bg-gray-50 border rounded-lg p-2 text-center min-w-[3rem] shrink-0">
                        <p className="text-xs font-medium text-gray-500 uppercase">{format(new Date(event.startDate), 'MMM')}</p>
                        <p className="text-lg font-bold text-primary leading-none">{format(new Date(event.startDate), 'dd')}</p>
                      </div>
                      <div className="py-1">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{event.title}</p>
                        <Badge variant="outline" className={`mt-1 text-[10px] ${
                          event.eventType === 'exam' ? 'text-purple-700 border-purple-200 bg-purple-50' : 
                          event.eventType === 'deadline' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                          'text-blue-700 border-blue-200 bg-blue-50'
                        }`}>
                          {event.eventType}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-2 text-sm">No upcoming events scheduled.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
