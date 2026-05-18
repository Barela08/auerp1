import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Search, TrendingUp, Users, Award } from "lucide-react";

interface Result {
  id: number;
  studentId: number;
  semester: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  status: string;
  totalCredits: number;
  equivalentPercentage: number;
  resultDate: string;
  studentName?: string;
  enrollmentNo?: string;
  program?: string;
  department?: string;
}

async function fetchAllResults(): Promise<Result[]> {
  const res = await fetch("/api/results", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function AdminResultsPage() {
  const { data: results, isLoading } = useQuery({ queryKey: ["admin-results"], queryFn: fetchAllResults });
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState<number | null>(null);

  const filtered = (results ?? []).filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.studentName?.toLowerCase().includes(q) || r.enrollmentNo?.toLowerCase().includes(q);
    const matchSem = semFilter === null || r.semester === semFilter;
    return matchSearch && matchSem;
  });

  const avgSgpa = filtered.length > 0 ? filtered.reduce((s, r) => s + (r.sgpa || 0), 0) / filtered.length : 0;
  const passCount = filtered.filter(r => r.status?.toLowerCase() === "pass").length;
  const distinctSems = [...new Set((results ?? []).map(r => r.semester))].sort();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage all student semester results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: filtered.length, icon: <GraduationCap className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
          { label: "Pass Rate", value: filtered.length > 0 ? `${((passCount / filtered.length) * 100).toFixed(0)}%` : "—", icon: <Award className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Avg SGPA", value: avgSgpa > 0 ? avgSgpa.toFixed(2) : "—", icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
          { label: "Students", value: new Set((results ?? []).map(r => r.studentId)).size, icon: <Users className="w-5 h-5" />, color: "text-amber-600 bg-amber-50" },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "…" : stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or enrollment no."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={semFilter === null ? "default" : "outline"} onClick={() => setSemFilter(null)}>All Sems</Button>
            {distinctSems.map(s => (
              <Button key={s} size="sm" variant={semFilter === s ? "default" : "outline"} onClick={() => setSemFilter(s)}>
                Sem {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Results List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Semester</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Acad. Year</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">SGPA</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">CGPA</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Credits</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.studentName || `Student ${r.studentId}`}</p>
                        <p className="text-xs text-gray-500">{r.enrollmentNo || `ID: ${r.studentId}`}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.program || r.department || "—"}</td>
                      <td className="px-4 py-3 text-center font-medium">{r.semester}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.academicYear || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-base ${r.sgpa >= 8.5 ? "text-emerald-600" : r.sgpa >= 6 ? "text-blue-600" : "text-red-600"}`}>
                          {r.sgpa?.toFixed(2) || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-700">{r.cgpa?.toFixed(2) || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.totalCredits || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={
                          r.status?.toLowerCase() === "pass"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }>
                          {(r.status || "—").toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
