import { useGetMyHallTickets } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Printer, FileText } from "lucide-react";
import { format } from "date-fns";

export function HallTicketPage() {
  const { data, isLoading, isError } = useGetMyHallTickets();

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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
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
          {/* Header */}
          <div className="bg-[#0f1e3c] text-white">
            <div className="p-6 text-center border-b border-white/20">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">AU</div>
                <div>
                  <h1 className="text-2xl font-bold font-serif">ALLIANCE UNIVERSITY</h1>
                  <p className="text-xs text-white/70">Chandapura-Anekal Main Road, Anekal, Bangalore – 562106</p>
                </div>
              </div>
            </div>
            <div className="bg-[#8b0000] text-center py-2">
              <h2 className="text-base font-bold tracking-widest uppercase">
                Hall Ticket — {ticket.examType || "End Semester Examination"}
              </h2>
            </div>
          </div>

          {/* Student Info */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Student Name</span>
                  <span className="font-semibold text-gray-900">: {ticket.studentName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Enrollment No</span>
                  <span className="font-semibold text-gray-900">: {ticket.enrollmentNo}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Hall Ticket No</span>
                  <span className="font-semibold text-gray-900">: HT-{ticket.id}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Program</span>
                  <span className="font-semibold text-gray-900">: {ticket.program}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Semester</span>
                  <span className="font-semibold text-gray-900">: {ticket.semester}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">Academic Year</span>
                  <span className="font-semibold text-gray-900">: {ticket.examYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Schedule */}
          <div className="p-6 border-b">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Examination Schedule</h3>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject Code</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Subject Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Hall No</th>
                </tr>
              </thead>
              <tbody>
                {(ticket.subjects || []).map((s: { date?: string; time?: string; subjectCode?: string; subjectName?: string; hallNo?: string }, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {s.date ? format(new Date(s.date), "dd/MM/yyyy") : "—"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{s.time || "10:00 AM - 1:00 PM"}</td>
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

          <div className="px-6 py-4 border-t flex justify-between text-xs text-gray-500">
            <span>Issued by: Controller of Examinations</span>
            <span>Alliance University, Bangalore</span>
          </div>
        </div>
      )}
    </div>
  );
}
