import { useGetMyHallTickets, useGetStudentDashboard } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Printer, FileText } from "lucide-react";
import { format } from "date-fns";
import { AUQRCode, AUBarcode } from "@/components/document-assets";

export function HallTicketPage() {
  const { data, isLoading, isError } = useGetMyHallTickets();
  const { data: dashData } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
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
            <p>Failed to load hall tickets.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tickets = Array.isArray(data) ? data : [];
  const ticket = tickets[0];
  const student = dashData?.student;
  const signature = (student as any)?.signatureUrl || null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hall Ticket</h1>
          <p className="text-gray-500 mt-1">Examination admit card</p>
        </div>
        {ticket && (
          <Button onClick={() => window.print()} className="no-print">
            <Printer className="w-4 h-4 mr-2" /> Print Hall Ticket
          </Button>
        )}
      </div>

      {!ticket ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hall ticket generated yet.</p>
            <p className="text-sm text-gray-400 mt-2">Hall tickets are generated after your exam form is approved.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white border-2 border-gray-300 shadow-xl" id="hall-ticket">
          {/* Header with horizontal logo */}
          <div className="border-b-4 border-[#8b0000]">
            <div className="p-4 flex flex-col items-center gap-1">
              <img
                src="/au-logo-horizontal.png"
                alt="Alliance University"
                className="object-contain"
                style={{ height: 64, maxWidth: 380 }}
              />
              <p className="text-xs text-gray-500 mt-1">Chandapura-Anekal Main Road, Anekal, Bangalore – 562106</p>
            </div>
            <div className="bg-[#0f1e3c] text-white text-center py-2">
              <h2 className="text-sm font-bold tracking-widest uppercase">
                Hall Ticket — {ticket.examType || "End Semester Examination"}
              </h2>
            </div>
            <div className="bg-[#8b0000] text-white text-center py-1.5">
              <p className="text-xs font-semibold tracking-wide">Academic Year: {ticket.examYear} &nbsp;|&nbsp; Semester: {ticket.semester}</p>
            </div>
          </div>

          {/* Student Info + Photo */}
          <div className="p-6 border-b">
            <div className="flex gap-6">
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Student Name</span>
                  <span className="font-semibold text-gray-900">: {ticket.studentName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Program</span>
                  <span className="font-semibold text-gray-900">: {ticket.program}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Enrollment No</span>
                  <span className="font-semibold text-gray-900">: {ticket.enrollmentNo}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Semester</span>
                  <span className="font-semibold text-gray-900">: {ticket.semester}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Hall Ticket No</span>
                  <span className="font-semibold text-gray-900">: HT-{ticket.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Academic Year</span>
                  <span className="font-semibold text-gray-900">: {ticket.examYear}</span>
                </div>
                {student && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-36 shrink-0">Roll No</span>
                      <span className="font-semibold text-gray-900">: {student.rollNo}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-36 shrink-0">Department</span>
                      <span className="font-semibold text-gray-900">: {student.department}</span>
                    </div>
                  </>
                )}
              </div>
              {/* Photo Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-24 h-28 border-2 border-gray-400 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {student?.photoUrl ? (
                    <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400 text-xs p-1">
                      <div className="text-2xl mb-1">👤</div>
                      <div>Photo</div>
                    </div>
                  )}
                </div>
                {/* Signature Box */}
                <div className="w-24 h-12 border border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {signature ? (
                    <img src={signature} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">Signature</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Exam Schedule */}
          <div className="p-6 border-b">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Examination Schedule</h3>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#0f1e3c] text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject Code</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Hall No</th>
                </tr>
              </thead>
              <tbody>
                {(ticket.subjects || []).map((s: { date?: string; time?: string; subjectCode?: string; subjectName?: string; hallNo?: string }, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">
                      {s.date ? format(new Date(s.date), "dd/MM/yyyy") : "—"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{s.time || "10:00 AM – 1:00 PM"}</td>
                    <td className="border border-gray-300 px-4 py-2 font-mono">{s.subjectCode || "—"}</td>
                    <td className="border border-gray-300 px-4 py-2">{s.subjectName || "—"}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{s.hallNo || "TBD"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Instructions to Candidates</h3>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Candidates must bring this hall ticket to every examination.</li>
              <li>Candidates should report to the examination hall 30 minutes before the examination.</li>
              <li>Mobile phones and electronic devices are not allowed in the examination hall.</li>
              <li>Candidates must produce their ID card along with the hall ticket.</li>
              <li>Any malpractice during examination will lead to cancellation of results.</li>
            </ol>
          </div>

          {/* Footer with signature + QR + Barcode */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-end justify-between gap-4">
            <div>
              <div className="w-36 h-10 border-b border-gray-400 mb-1"></div>
              <p className="text-xs text-gray-500">Student's Signature</p>
            </div>

            {/* QR Code + Barcode (Hall Ticket Number) */}
            <div className="flex flex-col items-center gap-1">
              <AUQRCode size={64} />
              <AUBarcode value={`HT-${ticket.id}`} height={28} textSize={7} showText={true} />
            </div>

            <div className="text-center">
              <img src="/signature-controller.webp" alt="Controller Signature" className="h-10 object-contain mx-auto mb-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <p className="text-xs text-gray-500">Controller of Examinations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
