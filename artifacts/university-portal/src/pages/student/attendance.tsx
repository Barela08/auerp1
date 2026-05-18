import { useState } from "react";
import { useGetMyAttendance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, BookOpen, ChevronDown, ChevronUp, Calendar } from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late";
  subjectName: string;
  subjectCode: string | null;
}

export function AttendancePage() {
  const { data, isLoading, isError } = useGetMyAttendance();
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [subjectRecords, setSubjectRecords] = useState<Record<number, AttendanceRecord[]>>({});
  const [loadingSubject, setLoadingSubject] = useState<number | null>(null);

  const loadSubjectDetails = async (subjectId: number) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
      return;
    }
    if (subjectRecords[subjectId]) {
      setExpandedSubject(subjectId);
      return;
    }
    setLoadingSubject(subjectId);
    try {
      const res = await fetch(`/api/attendance/my/${subjectId}`, { credentials: "include" });
      const records: AttendanceRecord[] = await res.json();
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSubjectRecords((prev) => ({ ...prev, [subjectId]: records }));
      setExpandedSubject(subjectId);
    } catch {
      // ignore
    } finally {
      setLoadingSubject(null);
    }
  };

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
  const lowAttendance = data.filter((r) => r.percentage < 75);

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

  const getStatusBadge = (status: string) => {
    if (status === "present") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">✓ Present</span>;
    if (status === "late") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">⏰ Late</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">✗ Absent</span>;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">Current semester attendance breakdown — click any subject to see date-wise history</p>
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
              You have low attendance in {lowAttendance.length} subject(s). Minimum 75% required to appear in exams.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise Breakdown — clickable */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subject-wise Attendance
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">Click on any subject to view date-wise attendance history</p>
        </CardHeader>
        <CardContent className="pt-4 divide-y divide-gray-100">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No attendance records found.</p>
          ) : (
            data.map((subject) => {
              const isExpanded = expandedSubject === subject.subjectId;
              const isThisLoading = loadingSubject === subject.subjectId;
              const records = subjectRecords[subject.subjectId] || [];

              return (
                <div key={subject.subjectId}>
                  {/* Subject Summary Row — clickable */}
                  <button
                    onClick={() => loadSubjectDetails(subject.subjectId)}
                    className="w-full text-left py-5 px-1 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {subject.subjectName}
                          </p>
                          {subject.subjectCode && (
                            <p className="text-xs text-gray-500 mt-0.5">{subject.subjectCode}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {subject.attendedClasses} attended / {subject.totalClasses} total
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getBadge(subject.percentage)}
                          <span className={`text-xl font-bold ${getStatusColor(subject.percentage)}`}>
                            {subject.percentage.toFixed(1)}%
                          </span>
                          <span className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </div>
                      <Progress value={subject.percentage} className={`h-2.5 ${getProgressColor(subject.percentage)}`} />
                    </div>
                  </button>

                  {/* Expanded Date-wise History */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100 px-2 pb-4 pt-2">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">Date-wise Attendance History</span>
                        <span className="text-xs text-gray-400">({records.length} classes)</span>
                      </div>

                      {isThisLoading ? (
                        <div className="space-y-2 px-1">
                          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                        </div>
                      ) : records.length === 0 ? (
                        <p className="text-sm text-gray-500 px-1">No records found.</p>
                      ) : (
                        <div className="max-h-72 overflow-y-auto rounded border border-gray-200 bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Day</th>
                                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {records.map((rec, idx) => (
                                <tr
                                  key={rec.id}
                                  className={rec.status === "absent" ? "bg-red-50/50" : rec.status === "late" ? "bg-amber-50/50" : ""}
                                >
                                  <td className="px-4 py-2 text-gray-400 text-xs">{records.length - idx}</td>
                                  <td className="px-4 py-2 font-medium text-gray-800">
                                    {new Date(rec.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </td>
                                  <td className="px-4 py-2 text-gray-500 text-xs">
                                    {new Date(rec.date).toLocaleDateString("en-IN", { weekday: "long" })}
                                  </td>
                                  <td className="px-4 py-2 text-center">{getStatusBadge(rec.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Mini summary */}
                      {records.length > 0 && (
                        <div className="flex gap-4 mt-3 px-1">
                          <span className="text-xs text-emerald-700 font-medium">
                            ✓ Present: {records.filter((r) => r.status === "present" || r.status === "late").length}
                          </span>
                          <span className="text-xs text-red-700 font-medium">
                            ✗ Absent: {records.filter((r) => r.status === "absent").length}
                          </span>
                          {records.filter((r) => r.status === "late").length > 0 && (
                            <span className="text-xs text-amber-700 font-medium">
                              ⏰ Late: {records.filter((r) => r.status === "late").length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
