import { useState } from "react";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";

export function AdminStudentsPage() {
  const { data: students, isLoading } = useListStudents();
  const [search, setSearch] = useState("");

  const filtered = (students || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-500 mt-1">All enrolled students</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{filtered.length} of {(students || []).length} students</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program / Dept</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sem</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div>{s.name}</div>
                          <div className="text-xs text-gray-400">{s.fatherName ? `Father: ${s.fatherName}` : ""}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.enrollmentNo}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-700 max-w-[180px]">{s.department}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{s.program}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{s.semester}</td>
                        <td className="px-4 py-3 text-center">{s.section || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.academicYear || "—"}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{s.cgpa?.toFixed(2) || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">{s.email}</div>
                          <div className="text-xs text-gray-400">{s.phone}</div>
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
