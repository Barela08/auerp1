import { useGetFeeReceipt } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer, ArrowLeft } from "lucide-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";

export function FeeReceiptPage() {
  const params = useParams<{ id: string }>();
  const feeId = params?.id ? parseInt(params.id) : 0;
  const { data: receipt, isLoading, isError } = useGetFeeReceipt(feeId);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-[800px]" /></div>;
  }

  if (isError || !receipt) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium">Receipt not found.</p>
          <Link href="/student/fees">
            <Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Fees</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link href="/student/fees">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Fees</Button>
        </Link>
        <Button onClick={() => window.print()} className="bg-primary">
          <Printer className="w-4 h-4 mr-2" /> Print Receipt
        </Button>
      </div>

      {/* Receipt Document */}
      <div className="bg-white border border-gray-300 shadow-lg" id="receipt">
        {/* University Header */}
        <div className="bg-[#0f1e3c] text-white p-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">AU</div>
            <div>
              <h1 className="text-2xl font-bold font-serif tracking-wide">ALLIANCE UNIVERSITY</h1>
              <p className="text-sm text-white/80 mt-1">Chandapura-Anekal Main Road, Anekal, Bangalore – 562106</p>
            </div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="bg-[#8b0000] text-white text-center py-3">
          <h2 className="text-lg font-bold tracking-widest uppercase">Fee Payment Receipt</h2>
        </div>

        {/* Receipt Details Header */}
        <div className="px-8 py-4 border-b bg-gray-50 flex justify-between text-sm">
          <div>
            <span className="text-gray-500 font-medium">Receipt No: </span>
            <span className="font-bold text-gray-900">{receipt.receiptNo}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Date: </span>
            <span className="font-bold text-gray-900">
              {receipt.receiptDate ? format(new Date(receipt.receiptDate), "dd/MM/yyyy") : "—"}
            </span>
          </div>
        </div>

        {/* Student Details */}
        <div className="px-8 py-6 border-b">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Student Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Student Name</span>
                <span className="font-semibold text-gray-900">: {receipt.studentName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Father's Name</span>
                <span className="font-semibold text-gray-900">: {receipt.fatherName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Enrollment No</span>
                <span className="font-semibold text-gray-900">: {receipt.enrollmentNo}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Admission No</span>
                <span className="font-semibold text-gray-900">: {receipt.admissionNo}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Course</span>
                <span className="font-semibold text-gray-900">: {receipt.course}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32 shrink-0">Payment Mode</span>
                <span className="font-semibold text-gray-900">: {receipt.paymentMode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Particulars */}
        <div className="px-8 py-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Fee Particulars</h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Sl. No.</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Particulars</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {receipt.particulars?.filter(p => p.amount > 0).map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{i + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{p.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="border border-gray-300 px-4 py-3 text-right font-bold">
                  TOTAL AMOUNT PAID
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-primary">
                  ₹{receipt.totalAmount?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              Amount in Words: <span className="text-gray-900 font-semibold">{receipt.amountInWords}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-500">
          <p>This is a computer generated receipt and does not require a signature.</p>
          <p>Bank: {receipt.bankName}</p>
        </div>
      </div>
    </div>
  );
}
