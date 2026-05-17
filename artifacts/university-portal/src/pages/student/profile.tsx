import { useGetStudentDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, User, GraduationCap, Phone, Mail, MapPin, Calendar, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function ProfilePage() {
  const { data, isLoading, isError } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student } = data;

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Personal and academic information</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="no-print">
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="shadow-sm overflow-hidden">
        <div className="bg-[#0f1e3c] h-24" />
        <CardContent className="p-6 pt-0 -mt-10">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white shadow-md flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-500 text-sm">{student.enrollmentNo}</p>
            </div>
            <div className="ml-auto pb-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                Semester {student.semester}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <InfoRow label="Enrollment No" value={student.enrollmentNo} />
            <InfoRow label="Roll No" value={student.rollNo} />
            <InfoRow label="Admission No" value={student.admissionNo} />
            <InfoRow label="Program" value={student.program} />
            <InfoRow label="Department" value={student.department} />
            <InfoRow label="Semester" value={`${student.semester}`} />
            <InfoRow label="Section" value={student.section} />
            <InfoRow label="Academic Year" value={student.academicYear} />
            <InfoRow label="CGPA" value={student.cgpa ? student.cgpa.toFixed(2) : null} />
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <InfoRow label="Full Name" value={student.name} />
            <InfoRow label="Date of Birth" value={student.dob ? format(new Date(student.dob), "dd MMMM yyyy") : null} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Father's Name" value={student.fatherName} />
            <InfoRow label="Mother's Name" value={student.motherName} />
            <InfoRow label="Address" value={student.address} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
