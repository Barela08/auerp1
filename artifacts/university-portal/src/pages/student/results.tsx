import { useState } from "react";
import { useGetMyResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, GraduationCap, Printer } from "lucide-react";
import { format } from "date-fns";

interface Subject {
  subjectCode: string;
  subjectName: string;
  credits: number;
  iaMarks: number;
  eaMarks: number;
  totalMarks: number;
  maxIa: number;
  maxEa: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
}

export function ResultsPage() {
  const { data, isLoading, isError } = useGetMyResults();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
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
            <p>Failed to load results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeResult = selectedSemester !== null
    ? data.find(r => r.semester === selectedSemester)
    : data[data.length - 1];

  const gradeColor = (grade: string) => {
    if (grade === "O") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (grade === "A+" || grade === "A") return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade === "B+" || grade === "B") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results & Marksheet</h1>
          <p className="text-gray-500 mt-1">Semester-wise academic results</p>
        </div>
        {activeResult && (
          <Button onClick={() => window.print()} variant="outline" className="hidden md:flex no-print">
            <Printer className="w-4 h-4 mr-2" /> Print Marksheet
          </Button>
        )}
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center py-12">
            <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No results published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Semester selector */}
          <div className="flex gap-2 flex-wrap">
            {data.map((r) => (
              <Button
                key={r.semester}
                variant={activeResult?.semester === r.semester ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSemester(r.semester)}
              >
                Semester {r.semester}
              </Button>
            ))}
          </div>

          {activeResult && (
            <div className="space-y-6">
              {/* SGPA / CGPA cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center border-l-4 border-l-primary shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">SGPA</p>
                    <p className="text-3xl font-bold text-primary mt-1">{activeResult.sgpa.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="text-center border-l-4 border-l-emerald-500 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">CGPA</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{activeResult.cgpa.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="text-center border-l-4 border-l-amber-500 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Percentage</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {activeResult.equivalentPercentage?.toFixed(1) || "—"}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center border-l-4 border-l-purple-500 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Credits</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{activeResult.totalCredits}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Marksheet */}
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-4 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Semester {activeResult.semester} Marksheet</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Academic Year: {activeResult.academicYear}</p>
                  </div>
                  <Badge className={activeResult.status === "pass" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                    {activeResult.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs">Code</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs">Subject</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">Credits</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">IA</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">EA</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">Total</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">Grade</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase text-xs">Grade Pt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(activeResult.subjects as Subject[]).map((subject, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.subjectCode}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{subject.subjectName}</td>
                            <td className="px-4 py-3 text-center">{subject.credits}</td>
                            <td className="px-4 py-3 text-center">{subject.iaMarks}/{subject.maxIa}</td>
                            <td className="px-4 py-3 text-center">{subject.eaMarks}/{subject.maxEa}</td>
                            <td className="px-4 py-3 text-center font-semibold">{subject.totalMarks}/{subject.maxTotal}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={gradeColor(subject.grade)}>
                                {subject.grade}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-primary">{subject.gradePoint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {activeResult.resultDate && (
                    <div className="px-4 py-3 border-t text-xs text-gray-500 text-right">
                      Result declared on: {format(new Date(activeResult.resultDate), "dd MMMM yyyy")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Scale */}
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Grade Scale</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {[["O", "10", "≥90%"], ["A+", "9", "80-89%"], ["A", "8", "70-79%"], ["B+", "7", "60-69%"], ["B", "6", "55-59%"], ["C", "5", "50-54%"], ["P", "4", "45-49%"], ["F", "0", "<45%"]].map(([g, gp, r]) => (
                      <div key={g} className={`px-3 py-2 rounded border text-xs ${gradeColor(g)}`}>
                        <span className="font-bold">{g}</span> – GP {gp} ({r})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
