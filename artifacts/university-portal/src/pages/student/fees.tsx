import { useGetMyFees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { CreditCard, Eye, Download, AlertCircle, Receipt } from "lucide-react";
import { format } from "date-fns";

export function FeesPage() {
  const { data, isLoading, isError } = useGetMyFees();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
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
            <p className="font-medium">Failed to load fee records.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paidPercent = data.totalFees > 0 ? (data.paidAmount / data.totalFees) * 100 : 0;

  const statusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Paid</Badge>;
    if (status === "partial") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Details</h1>
        <p className="text-gray-500 mt-1">View and manage your fee payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Total Fees</p>
            <p className="text-3xl font-bold mt-1">₹{data.totalFees.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Paid Amount</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">₹{data.paidAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 shadow-sm ${data.pendingAmount > 0 ? "border-l-destructive" : "border-l-emerald-500"}`}>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 font-medium">Pending Amount</p>
            <p className={`text-3xl font-bold mt-1 ${data.pendingAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>
              ₹{data.pendingAmount.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Payment Progress</span>
            <span className="font-bold">{paidPercent.toFixed(1)}%</span>
          </div>
          <Progress value={paidPercent} className="h-3" />
          <p className="text-xs text-gray-500 mt-2">
            ₹{data.paidAmount.toLocaleString("en-IN")} paid of ₹{data.totalFees.toLocaleString("en-IN")} total
          </p>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Semester-wise Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Year</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fees</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.records.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">Semester {fee.semester}</td>
                    <td className="px-5 py-4 text-gray-600">{fee.academicYear || "—"}</td>
                    <td className="px-5 py-4 text-right font-semibold">₹{fee.totalFees.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-emerald-600 font-semibold">₹{fee.paidAmount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-destructive font-semibold">₹{fee.pendingAmount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">
                      {fee.dueDate ? format(new Date(fee.dueDate), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-5 py-4 text-center">{statusBadge(fee.status)}</td>
                    <td className="px-5 py-4 text-center">
                      {fee.receiptNo ? (
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/student/fees/${fee.id}/receipt`}>
                            <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/5">
                              <Eye className="w-3.5 h-3.5 mr-1" />View
                            </Button>
                          </Link>
                          <Link href={`/student/fees/${fee.id}/receipt`}>
                            <Button size="sm" className="bg-[#8b0000] hover:bg-[#6b0000] text-white">
                              <Download className="w-3.5 h-3.5 mr-1" />Download
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
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
