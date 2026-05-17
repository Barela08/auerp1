import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Printer } from "lucide-react";

export function IdCardPage() {
  const { data, isLoading, isError } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-80 w-96 mx-auto" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load ID card.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student } = data;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-500 mt-1">Digital identity card for Alliance University</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="no-print">
          <Printer className="w-4 h-4 mr-2" /> Print ID Card
        </Button>
      </div>

      {/* ID Card */}
      <div className="flex justify-center">
        <div className="w-[360px] shadow-2xl rounded-xl overflow-hidden border border-gray-300" id="id-card">
          {/* Card Header */}
          <div className="bg-[#0f1e3c] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">AU</div>
              <div>
                <p className="text-white font-bold font-serif text-sm">ALLIANCE UNIVERSITY</p>
                <p className="text-white/60 text-[10px]">Bangalore – 562106</p>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-[#8b0000]" />
            <p className="text-[#8b0000] text-[10px] font-bold uppercase tracking-widest mt-1.5 text-center">Student Identity Card</p>
          </div>

          {/* Card Body */}
          <div className="bg-white p-4 flex gap-4">
            {/* Photo placeholder */}
            <div className="w-24 h-28 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center flex-shrink-0">
              <div className="text-center text-gray-400 text-xs">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-1">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                Photo
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-bold text-gray-900 text-sm">{student.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Enrollment No</p>
                <p className="font-semibold text-gray-800 font-mono text-[11px]">{student.enrollmentNo}</p>
              </div>
              <div>
                <p className="text-gray-500">Program</p>
                <p className="font-semibold text-gray-800">{student.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Semester / Section</p>
                <p className="font-semibold text-gray-800">Sem {student.semester} / {student.section}</p>
              </div>
              <div>
                <p className="text-gray-500">Blood Group</p>
                <p className="font-semibold text-gray-800">—</p>
              </div>
            </div>
          </div>

          {/* QR / Barcode area */}
          <div className="bg-gray-50 border-t px-4 py-3 flex items-center justify-between">
            <div className="text-[10px] text-gray-500">
              <p>Valid for Academic Year: {student.academicYear || "2024-25"}</p>
              <p className="mt-0.5 text-gray-400">{student.email}</p>
            </div>
            <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-400 font-mono">
              QR
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#8b0000] py-1.5 text-center">
            <p className="text-white text-[9px] tracking-widest uppercase">If found, please return to Alliance University</p>
          </div>
        </div>
      </div>
    </div>
  );
}
