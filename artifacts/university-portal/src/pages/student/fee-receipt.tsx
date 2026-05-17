import { useGetFeeReceipt } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer, ArrowLeft } from "lucide-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";

const ALL_PARTICULARS = [
  "REGISTRATION FEE",
  "SECURITY DEPOSIT HOSTEL",
  "TRANSPORTATION CHARGES",
  "OTHERS",
  "CONVOCATION FEE",
  "UNIFORM FEE",
  "SECURITY DEPOSIT ACADEMIC",
  "TOUR FEE",
  "HOSTEL ADMISSION FEE",
  "EXAMINATION FEE",
  "FINE",
  "PRACTICAL RECORD FEE",
  "EDCM BANK CHARGES",
  "RE-REGISTRATION FEES",
];

function toWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  };
  return convert(n) + " Only";
}

export function FeeReceiptPage() {
  const params = useParams<{ id: string }>();
  const feeId = params?.id ? parseInt(params.id) : 0;
  const { data: receipt, isLoading, isError } = useGetFeeReceipt(feeId);

  if (isLoading) return <div className="p-8"><Skeleton className="h-[900px]" /></div>;

  if (isError || !receipt) {
    return (
      <div className="p-8 text-center text-destructive">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p className="font-medium">Receipt not found.</p>
        <Link href="/student/fees">
          <Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Fees</Button>
        </Link>
      </div>
    );
  }

  const particularsMap: Record<string, number> = {};
  receipt.particulars?.forEach((p) => { particularsMap[p.name.toUpperCase()] = p.amount; });
  const totalAmount = receipt.totalAmount ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <Link href="/student/fees">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </Link>
        <Button onClick={() => window.print()} size="sm" className="bg-[#8b0000] hover:bg-[#6b0000]">
          <Printer className="w-4 h-4 mr-2" />Print / Download
        </Button>
      </div>

      {/* ── RECEIPT DOCUMENT ── */}
      <div className="bg-white border border-gray-300 shadow-lg text-sm" id="receipt" style={{ fontFamily: "Arial, sans-serif" }}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-300">
          <div className="flex items-center gap-3">
            <img src="/au-logo-round.webp" alt="AU" className="w-16 h-16 object-contain" />
          </div>
          <div className="text-center flex-1 px-4">
            <h1 className="font-black tracking-widest text-[#8b0000]" style={{ fontSize: "2rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>
              ALLIANCE
            </h1>
            <h1 className="font-black tracking-widest text-[#1a237e]" style={{ fontSize: "1.6rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>
              UNIVERSITY
            </h1>
          </div>
          <div className="text-right">
            <div className="border border-gray-400 px-2 py-1 text-center">
              <p className="text-[9px] font-bold text-gray-600 tracking-wider">NAAC</p>
              <p className="text-[9px] font-bold text-gray-600 tracking-wider">GRADE</p>
              <p className="text-xl font-black text-[#8b0000]" style={{ lineHeight: 1 }}>A+</p>
              <p className="text-[7px] text-gray-600">ACCREDITED UNIVERSITY</p>
            </div>
          </div>
        </div>

        {/* decorative lines */}
        <div className="mx-6 mt-1">
          <div className="border-t-2 border-[#1a237e]" />
          <div className="border-t border-[#1a237e] mt-0.5" />
        </div>

        {/* ── TITLE ── */}
        <div className="text-center py-3">
          <p className="font-bold tracking-[0.25em] text-base text-gray-800">FEE RECEIPT</p>
          <p className="text-gray-400 text-xs">— ✦ —</p>
        </div>

        <div className="mx-6 mb-2">
          <div className="border-t border-gray-300" />
        </div>

        {/* ── STUDENT DETAILS ── */}
        <div className="px-6 py-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12.5px]">
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Receipt No.</span>
              <span>: {receipt.receiptNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Student Name</span>
              <span>: {receipt.studentName}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Father's Name</span>
              <span>: {receipt.fatherName}</span>
            </div>
            <div className="flex gap-1 items-start">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Address</span>
              <span>: {receipt.address || "—"}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Receipt Date</span>
              <span>: {receipt.receiptDate ? format(new Date(receipt.receiptDate), "dd-MM-yyyy") : "—"}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Admission No.</span>
              <span>: {receipt.admissionNo || receipt.enrollmentNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Course</span>
              <span>: {receipt.course}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-28 font-semibold text-gray-700 shrink-0">Uni. Regn. No.</span>
              <span>: </span>
            </div>
          </div>
        </div>

        {/* ── PARTICULARS TABLE ── */}
        <div className="px-6 pb-2">
          <table className="w-full text-[12.5px] border-collapse">
            <thead>
              <tr style={{ background: "#1a237e" }}>
                <th className="text-white font-bold py-2 px-4 text-left tracking-wider" style={{ width: "75%" }}>PARTICULARS</th>
                <th className="text-white font-bold py-2 px-4 text-right tracking-wider">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ALL_PARTICULARS.map((name, i) => (
                <tr key={i} className="border-b border-gray-200" style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td className="py-1.5 px-4 text-gray-700">{name}</td>
                  <td className="py-1.5 px-4 text-right text-gray-700">{particularsMap[name] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTAL ── */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-300 mx-6 mx-0">
          <div className="text-[12.5px]">
            <span className="font-bold">Amount in Words: </span>
            <span className="italic">{receipt.amountInWords || `Rupees ${toWords(totalAmount)}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 font-bold text-sm tracking-wider" style={{ background: "#1a237e", color: "#fff" }}>
              TOTAL AMOUNT
            </div>
            <div className="border border-gray-400 px-3 py-1.5 font-bold text-sm">
              ₹ {totalAmount.toLocaleString("en-IN")}/-
            </div>
          </div>
        </div>

        {/* ── PAYMENT DETAILS ── */}
        <div className="px-6 py-3 grid grid-cols-2 gap-8 text-[11.5px] border-t border-gray-200">
          <div className="space-y-0.5 text-gray-700">
            <p>Cmp ID: RAJ {totalAmount}.</p>
            <p>No.: UPI450778686235</p>
            <p>Subject to encashment of Cheque/DD | SEM TUTION FEES PART</p>
            <p>Note: All fee is non-refundable.</p>
            <p>Only the security deposit will be refunded after</p>
            <p>completion of course.</p>
          </div>
          <div className="space-y-0.5 text-gray-700">
            <p>Amount Received: ₹ {totalAmount.toLocaleString("en-IN")}/-</p>
            <p>Drawn on: {receipt.bankName || "ICICI BANK"}</p>
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div className="px-6 pt-2 pb-4 flex items-end justify-between border-t border-gray-200">
          <div className="flex items-end gap-2">
            <img src="/au-logo-round.webp" alt="Stamp" className="w-16 h-16 object-contain opacity-80" />
          </div>
          <div className="text-right text-[12px]">
            <p className="font-bold text-gray-800 mb-1">For ALLIANCE UNIVERSITY</p>
            <img src="/signature-controller.webp" alt="Signature" className="h-10 ml-auto" style={{ maxWidth: "160px" }} />
            <div className="border-t border-gray-400 mt-1 pt-0.5 text-gray-600 text-[10px]">Authorized Signatory</div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t-2 border-[#1a237e] mx-4" />
        <div className="text-center py-2 text-[10px] text-gray-600">
          <p><span className="font-semibold">Campus:</span> Alliance University, Chandapura - Anekal Main Road, Chandapura, Bengaluru - 562106, Karnataka, India.</p>
          <p><span className="font-semibold">Phone:</span> +91 80 4619 0000 &nbsp;|&nbsp; <span className="font-semibold">Email:</span> info@alliance.edu.in &nbsp;|&nbsp; <span className="font-semibold">Website:</span> www.alliance.edu.in</p>
        </div>
      </div>
    </div>
  );
}
