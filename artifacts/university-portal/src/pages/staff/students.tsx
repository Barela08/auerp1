import { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, GraduationCap } from "lucide-react";

export function StaffStudentsPage() {
  const { data: students, isLoading } = useListStudents();
  const [search, setSearch] = useState("");

  const filtered = (students || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">View and manage student records</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, enrollment no, department..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} students</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sem</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Section</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                        <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{s.enrollmentNo}</td>
                        <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{s.program}</td>
                        <td className="px-5 py-3 text-gray-600">{s.department}</td>
                        <td className="px-5 py-3 text-center">{s.semester}</td>
                        <td className="px-5 py-3 text-center">{s.section || "—"}</td>
                        <td className="px-5 py-3 text-right font-semibold text-primary">{s.cgpa?.toFixed(2) || "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
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
