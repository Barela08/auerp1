import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Search } from "lucide-react";

export function AdminStaffPage() {
  const { data: staff, isLoading } = useListStaff();
  const [search, setSearch] = useState("");

  const filtered = (staff || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-500 mt-1">Faculty and administrative staff directory</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search staff..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{filtered.length} staff members</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Designation</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No staff found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{s.employeeId}</td>
                        <td className="px-5 py-3 text-gray-700">{s.designation}</td>
                        <td className="px-5 py-3 text-gray-600">{s.department}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
                        <td className="px-5 py-3 text-gray-500">{s.phone}</td>
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
