import { useGetFeeReceipt } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer, Download, ArrowLeft } from "lucide-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { useBranding } from "@/contexts/branding-context";
import { AUBarcode } from "@/components/document-assets";

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
  const branding = useBranding();

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

  const r = receipt as typeof receipt & {
    motherName?: string;
    universityRegNo?: string;
    department?: string;
    semester?: number;
    academicYear?: string;
    bloodGroup?: string;
    category?: string;
    transactionId?: string;
    feeType?: string;
    bankName?: string;
  };

  const particularsMap: Record<string, number> = {};
  receipt.particulars?.forEach((p) => { particularsMap[p.name.toUpperCase()] = p.amount; });

  const ALL_PARTICULARS = [
    r.feeType?.toUpperCase() || "SEMESTER TUITION FEES",
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

  const totalAmount = receipt.totalAmount ?? 0;
  const logoSrc = branding.logo_round ?? "/au-logo-round.png";

  const handlePrint = () => {
    const style = document.createElement("style");
    style.innerHTML = `@media print { .no-print { display: none !important; } body { margin: 0; } }`;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <Link href="/student/fees">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={handlePrint} size="sm" variant="outline" className="border-[#8b0000] text-[#8b0000] hover:bg-red-50">
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Button onClick={handlePrint} size="sm" className="bg-[#8b0000] hover:bg-[#6b0000]">
            <Download className="w-4 h-4 mr-2" />Download
          </Button>
        </div>
      </div>

      {/* ── RECEIPT DOCUMENT ── */}
      <div className="bg-white border border-gray-300 shadow-lg text-sm" id="receipt" style={{ fontFamily: "Arial, sans-serif" }}>

        {/* ── HEADER ── */}
        <div className="flex flex-col items-center px-6 py-4 border-b-2 border-gray-300">
          <img src="/au-logo-horizontal.png" alt="Alliance University" className="object-contain" style={{ height: 68, maxWidth: 380 }} />
          <p className="text-gray-500 text-[10px] mt-1">Chandapura-Anekal Main Road, Anekal, Bangalore – 562106 | NAAC Grade A+</p>
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
        <div className="px-6 py-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12px]">
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Receipt No.</span>
              <span>: {receipt.receiptNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Student Name</span>
              <span>: {receipt.studentName}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Father's Name</span>
              <span>: {receipt.fatherName}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Mother's Name</span>
              <span>: {r.motherName || "—"}</span>
            </div>
            <div className="flex gap-1 items-start">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Address</span>
              <span>: {receipt.address || "—"}</span>
            </div>
            {r.bloodGroup && (
              <div className="flex gap-1">
                <span className="w-32 font-semibold text-gray-700 shrink-0">Blood Group</span>
                <span>: {r.bloodGroup}</span>
              </div>
            )}
            {r.category && (
              <div className="flex gap-1">
                <span className="w-32 font-semibold text-gray-700 shrink-0">Category</span>
                <span>: {r.category}</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Receipt Date</span>
              <span>: {receipt.receiptDate ? format(new Date(receipt.receiptDate), "dd-MM-yyyy") : "—"}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Admission No.</span>
              <span>: {receipt.admissionNo || receipt.enrollmentNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Uni. Regn. No.</span>
              <span>: {r.universityRegNo || "—"}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Course</span>
              <span>: {receipt.course}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Department</span>
              <span>: {r.department || "—"}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Semester</span>
              <span>: {r.semester ? `${r.semester}` : "—"}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-32 font-semibold text-gray-700 shrink-0">Academic Year</span>
              <span>: {r.academicYear || "—"}</span>
            </div>
          </div>
        </div>

        {/* ── PARTICULARS TABLE ── */}
        <div className="px-6 pb-2">
          <table className="w-full text-[12px] border-collapse">
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
                  <td className="py-1.5 px-4 text-right text-gray-700">
                    {(particularsMap[name] ?? 0) > 0
                      ? (particularsMap[name]).toLocaleString("en-IN")
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTAL ── */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-300">
          <div className="text-[12px]">
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
            <p><span className="font-semibold">Fee Type:</span> {r.feeType || "Semester Tuition Fees"}</p>
            <p><span className="font-semibold">Payment Mode:</span> {receipt.paymentMode}</p>
            {r.transactionId && <p><span className="font-semibold">Transaction ID:</span> {r.transactionId}</p>}
            <p className="text-gray-500 mt-1">Note: All fee is non-refundable.</p>
            <p className="text-gray-500">Only the security deposit will be refunded after completion of course.</p>
          </div>
          <div className="space-y-0.5 text-gray-700">
            <p><span className="font-semibold">Amount Received:</span> ₹ {totalAmount.toLocaleString("en-IN")}/-</p>
            <p><span className="font-semibold">Payment Status:</span> <span className="text-green-600 font-bold">{((r as any).status ?? "SUCCESS").toString().toUpperCase()}</span></p>
            <p><span className="font-semibold">Drawn On:</span> {r.bankName || "ICICI BANK"}</p>
            {receipt.receiptDate && (
              <p><span className="font-semibold">Date:</span> {format(new Date(receipt.receiptDate), "dd-MM-yyyy")}</p>
            )}
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div className="px-6 pt-2 pb-4 flex items-end justify-between border-t border-gray-200">
          <div className="flex items-end gap-2">
            <img src={logoSrc} alt="Stamp" className="w-16 h-16 object-contain opacity-80" />
          </div>

          {/* Receipt Barcode */}
          <div className="flex flex-col items-center gap-1">
            <AUBarcode value={String(receipt.receiptNo || `RCP${feeId}`)} height={36} textSize={8} showText={true} />
          </div>

          <div className="text-right text-[12px]">
            <p className="font-bold text-gray-800 mb-1">For ALLIANCE UNIVERSITY</p>
            {branding.signature_controller ? (
              <img src={branding.signature_controller} alt="Signature" className="h-10 ml-auto" style={{ maxWidth: "160px" }} />
            ) : (
              <div className="h-10 border-b border-gray-400 w-40 ml-auto" />
            )}
            <div className="border-t border-gray-400 mt-1 pt-0.5 text-gray-600 text-[10px]">Authorized Signatory / Accounts Dept.</div>
          </div>
        </div>

        {/* ── NOTE ── */}
        <div className="px-6 pb-3 text-[10.5px] text-gray-500 border-t border-gray-100">
          <p>• This receipt is digitally generated and valid for academic verification purposes only.</p>
          <p>• Keep this receipt safe for future verification. All fees are non-refundable.</p>
          <p>• Valid for academic verification purposes only.</p>
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
