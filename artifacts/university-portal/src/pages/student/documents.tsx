import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { IdCard, Receipt, FileText, GraduationCap, BookOpen, ClipboardList, Award, FileCheck, FileBadge } from "lucide-react";

interface DocCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const DOCUMENTS: DocCard[] = [
  {
    title: "Student ID Card",
    description: "Official Alliance University identity card with barcode",
    href: "/student/id-card",
    icon: <IdCard className="w-7 h-7" />,
    color: "bg-blue-600",
    available: true,
  },
  {
    title: "Fee Receipts",
    description: "Semester-wise fee payment receipts",
    href: "/student/fees",
    icon: <Receipt className="w-7 h-7" />,
    color: "bg-emerald-600",
    available: true,
  },
  {
    title: "Hall Ticket",
    description: "Examination admit card with schedule",
    href: "/student/hall-ticket",
    icon: <FileCheck className="w-7 h-7" />,
    color: "bg-purple-600",
    available: true,
  },
  {
    title: "Semester Grade Report",
    description: "Detailed marks and grade report per semester",
    href: "/student/results",
    icon: <GraduationCap className="w-7 h-7" />,
    color: "bg-[#8b0000]",
    available: true,
  },
  {
    title: "Exam Form",
    description: "Examination registration form status",
    href: "/student/exam-forms",
    icon: <BookOpen className="w-7 h-7" />,
    color: "bg-amber-600",
    available: true,
  },
  {
    title: "Attendance Report",
    description: "Subject-wise attendance details",
    href: "/student/attendance",
    icon: <ClipboardList className="w-7 h-7" />,
    color: "bg-teal-600",
    available: true,
  },
  {
    title: "Bonafide Certificate",
    description: "Certificate confirming enrollment at the university",
    href: "/student/bonafide-certificate",
    icon: <Award className="w-7 h-7" />,
    color: "bg-indigo-600",
    available: true,
  },
  {
    title: "Character Certificate",
    description: "Certificate of conduct issued by the university",
    href: "/student/character-certificate",
    icon: <FileText className="w-7 h-7" />,
    color: "bg-pink-700",
    available: true,
  },
  {
    title: "Migration Certificate",
    description: "Document for transfer to another institution",
    href: "/student/migration-certificate",
    icon: <FileBadge className="w-7 h-7" />,
    color: "bg-orange-700",
    available: true,
  },
];

export function DocumentsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">All your academic documents and certificates in one place</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {DOCUMENTS.map((doc) => (
          doc.available ? (
            <Link key={doc.title} href={doc.href}>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-gray-200">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className={`${doc.color} text-white p-2.5 rounded-lg shrink-0`}>
                    {doc.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    <p className="text-xs text-primary font-semibold mt-2">View / Download →</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card key={doc.title} className="border-gray-200 opacity-60">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className={`${doc.color} text-white p-2.5 rounded-lg shrink-0`}>
                  {doc.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{doc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                  <p className="text-xs text-gray-400 font-medium mt-2">Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
