import { useState } from "react";
import { useListFees } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Search } from "lucide-react";

export function AdminFeesPage() {
  const { data, isLoading } = useListFees();
  const [search, setSearch] = useState("");

  const fees = Array.isArray(data) ? data : [];
  const filtered = fees.filter(f =>
    (f.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    String(f.studentId).includes(search) ||
    String(f.semester).includes(search)
  );

  const totalRevenue = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalPending = fees.reduce((s, f) => s + f.pendingAmount, 0);

  const statusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Paid</Badge>;
    if (status === "partial") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-500 mt-1">All student fee records</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Revenue Collected</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Pending Amount</p>
            <p className="text-3xl font-bold text-red-600 mt-1">₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by student or semester..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Semester</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pending</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receipt No</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        No fee records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{f.studentName || `Student #${f.studentId}`}</p>
                          <p className="text-xs text-gray-400">ID: {f.studentId}</p>
                        </td>
                        <td className="px-4 py-3 text-center">Sem {f.semester}</td>
                        <td className="px-4 py-3 text-gray-600">{f.academicYear || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold">₹{f.totalFees.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-semibold">₹{f.paidAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">₹{f.pendingAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">{statusBadge(f.status)}</td>
                        <td className="px-4 py-3 text-gray-500">{f.receiptNo || "—"}</td>
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
