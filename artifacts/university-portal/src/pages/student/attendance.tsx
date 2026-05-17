import { useGetMyAttendance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, BookOpen } from "lucide-react";

export function AttendancePage() {
  const { data, isLoading, isError } = useGetMyAttendance();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
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
            <p>Failed to load attendance data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalClasses = data.reduce((s, r) => s + r.totalClasses, 0);
  const attendedClasses = data.reduce((s, r) => s + r.attendedClasses, 0);
  const overallPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  const lowAttendance = data.filter(r => r.percentage < 75);
  const goodAttendance = data.filter(r => r.percentage >= 75);

  const getStatusColor = (pct: number) => {
    if (pct >= 85) return "text-emerald-600";
    if (pct >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 85) return "[&>div]:bg-emerald-500";
    if (pct >= 75) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
  };

  const getBadge = (pct: number) => {
    if (pct >= 85) return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Good</Badge>;
    if (pct >= 75) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Minimum</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Low</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">Current semester attendance breakdown</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Overall Attendance</p>
            <p className={`text-3xl font-bold mt-1 ${getStatusColor(overallPercentage)}`}>
              {overallPercentage.toFixed(1)}%
            </p>
            <Progress value={overallPercentage} className={`h-2 mt-2 ${getProgressColor(overallPercentage)}`} />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Classes Attended</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{attendedClasses}</p>
            <p className="text-xs text-gray-400 mt-1">out of {totalClasses} total classes</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Subjects at Risk</p>
            <p className="text-3xl font-bold mt-1 text-amber-600">{lowAttendance.length}</p>
            <p className="text-xs text-gray-400 mt-1">subjects below 75% threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Warning */}
      {lowAttendance.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Attendance Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-3">
              You have low attendance in {lowAttendance.length} subject(s). Minimum 75% attendance is required to appear in exams.
            </p>
            <div className="space-y-2">
              {lowAttendance.map((s) => (
                <div key={s.subjectId} className="bg-white p-3 rounded border border-amber-100 flex items-center justify-between">
                  <span className="text-sm font-medium">{s.subjectName}</span>
                  <span className="text-sm font-bold text-red-600">{s.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subject-wise Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No attendance records found.</p>
          ) : (
            data.map((subject) => (
              <div key={subject.subjectId} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{subject.subjectName}</p>
                    {subject.subjectCode && (
                      <p className="text-xs text-gray-500 mt-0.5">{subject.subjectCode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getBadge(subject.percentage)}
                    <span className={`text-xl font-bold ${getStatusColor(subject.percentage)}`}>
                      {subject.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={subject.percentage} className={`h-3 ${getProgressColor(subject.percentage)}`} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{subject.attendedClasses} classes attended</span>
                  <span>{subject.totalClasses} total classes</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
