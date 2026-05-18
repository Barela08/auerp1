import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  staffTable,
  feesTable,
  attendanceTable,
  resultsTable,
  notificationsTable,
  calendarEventsTable,
  examFormsTable,
  siteSettings,
} from "@workspace/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.insert(siteSettings).values([
    { key: "university_name", value: "Alliance University" },
    { key: "university_tagline", value: "NAAC A+ Accredited University" },
    { key: "academic_year", value: "2024-25" },
    { key: "current_semester", value: "4" },
  ]).onConflictDoNothing();

  const [staff1] = await db.insert(staffTable).values([
    { name: "Dr. Ramesh Kumar", employeeId: "AU-FAC-001", department: "Computer Science", designation: "Associate Professor", email: "ramesh.kumar@alliance.edu", phone: "9876543210" },
    { name: "Prof. Sunita Sharma", employeeId: "AU-FAC-002", department: "Mathematics", designation: "Assistant Professor", email: "sunita.sharma@alliance.edu", phone: "9876543211" },
  ]).returning();

  const [student1] = await db.insert(studentsTable).values([
    {
      name: "Nilesh Barela",
      enrollmentNo: "AU2021CS001",
      rollNo: "21CS001",
      admissionNo: "RTUBETCH-CS/2024-25/020",
      universityRegNo: "AU2405221002",
      program: "B.Tech",
      department: "Computer Science",
      semester: 4,
      section: "A",
      academicYear: "2024-25",
      email: "barelanilesh483@gmail.com",
      phone: "9123456789",
      fatherName: "Jagdish Barela",
      motherName: "Sita Barela",
      dob: "2003-05-15",
      address: "123, MG Road, Bangalore - 560001",
      bloodGroup: "O+",
      category: "General",
      cgpa: 8.4,
      sgpa: 8.7,
      attendancePct: 84.5,
    },
    {
      name: "Priya Mehta",
      enrollmentNo: "AU2021CS002",
      rollNo: "21CS002",
      admissionNo: "RTUBETCH-CS/2024-25/021",
      universityRegNo: "AU2405221003",
      program: "B.Tech",
      department: "Computer Science",
      semester: 4,
      section: "A",
      academicYear: "2024-25",
      email: "priya.mehta@student.alliance.edu",
      phone: "9123456790",
      fatherName: "Suresh Mehta",
      motherName: "Anita Mehta",
      dob: "2003-08-20",
      address: "45, HSR Layout, Bangalore - 560102",
      bloodGroup: "A+",
      category: "General",
      cgpa: 9.1,
      sgpa: 9.3,
      attendancePct: 91.0,
    },
  ]).returning();

  await db.insert(usersTable).values([
    { username: "nilesh.barela", passwordHash: "Nilu@2006", role: "student", name: "Nilesh Barela", email: "barelanilesh483@gmail.com", studentId: student1.id },
    { username: "priya.mehta", passwordHash: "Priya@2006", role: "student", name: "Priya Mehta", email: "priya.mehta@student.alliance.edu", studentId: student1.id + 1 },
    { username: "ramesh.kumar", passwordHash: "Staff@2024", role: "staff", name: "Dr. Ramesh Kumar", email: "ramesh.kumar@alliance.edu", staffId: staff1.id },
    { username: "teacher", passwordHash: "password123", role: "staff", name: "Dr. Ramesh Kumar", email: "teacher@alliance.edu.in", staffId: staff1.id },
    { username: "admin", passwordHash: "Admin@2024", role: "admin", name: "Administrator", email: "admin@alliance.edu" },
    { username: "admin2", passwordHash: "password123", role: "admin", name: "Administrator", email: "admin@alliance.edu.in" },
  ]);

  await db.insert(feesTable).values([
    { studentId: student1.id, semester: 1, academicYear: "2021-22", totalFees: 125000, paidAmount: 125000, pendingAmount: 0, status: "paid", dueDate: "2021-08-01", paidDate: "2021-07-25", paymentMode: "Online", receiptNo: "RCP-2021-001", feeType: "Semester Fee", bankName: "ICICI BANK", transactionId: "UPI450778686235" },
    { studentId: student1.id, semester: 2, academicYear: "2021-22", totalFees: 125000, paidAmount: 125000, pendingAmount: 0, status: "paid", dueDate: "2022-01-01", paidDate: "2021-12-28", paymentMode: "Online", receiptNo: "RCP-2022-001", feeType: "Semester Fee", bankName: "ICICI BANK", transactionId: "UPI450778686236" },
    { studentId: student1.id, semester: 3, academicYear: "2022-23", totalFees: 130000, paidAmount: 130000, pendingAmount: 0, status: "paid", dueDate: "2022-08-01", paidDate: "2022-07-30", paymentMode: "Bank Transfer", receiptNo: "RCP-2022-002", feeType: "Semester Fee", bankName: "SBI", transactionId: "NEFT202207305678" },
    { studentId: student1.id, semester: 4, academicYear: "2024-25", totalFees: 135000, paidAmount: 67500, pendingAmount: 67500, status: "partial", dueDate: "2024-08-15", paymentMode: "Online", receiptNo: "RCP-2024-001", feeType: "Semester Fee", bankName: "ICICI BANK", transactionId: "UPI450778686237" },
  ]);

  // Attendance
  const subjects = [
    { id: 101, name: "Data Structures & Algorithms", code: "CS301" },
    { id: 102, name: "Database Management Systems", code: "CS302" },
    { id: 103, name: "Operating Systems", code: "CS303" },
    { id: 104, name: "Computer Networks", code: "CS304" },
    { id: 105, name: "Mathematics-IV", code: "MA301" },
  ];
  const attendanceRecords = [];
  const startDate = new Date("2024-08-01");
  const endDate = new Date("2024-11-30");
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const dateStr = d.toISOString().split("T")[0];
    for (const subj of subjects) {
      const rand = Math.random();
      const status: "present" | "absent" | "late" = rand > 0.15 ? "present" : rand > 0.05 ? "late" : "absent";
      attendanceRecords.push({ studentId: student1.id, subjectId: subj.id, subjectName: subj.name, subjectCode: subj.code, date: dateStr, status, markedBy: "Dr. Ramesh Kumar" });
    }
  }
  for (let i = 0; i < attendanceRecords.length; i += 100) {
    await db.insert(attendanceTable).values(attendanceRecords.slice(i, i + 100));
  }

  // Results with full IA/EA marks
  await db.insert(resultsTable).values([
    {
      studentId: student1.id, semester: 1, academicYear: "2021-22", sgpa: 9.17, cgpa: 9.17, status: "pass",
      totalCredits: 26, equivalentPercentage: 91.7, resultDate: "2022-05-22",
      subjects: JSON.stringify([
        { subjectCode: "MAT101", subjectName: "Engineering Mathematics - I", credits: 4, iaMarks: 24, eaMarks: 72, totalMarks: 96, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "PHY101", subjectName: "Engineering Physics", credits: 4, iaMarks: 25, eaMarks: 70, totalMarks: 95, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "CHE101", subjectName: "Engineering Chemistry", credits: 4, iaMarks: 23, eaMarks: 68, totalMarks: 91, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "CSP101", subjectName: "Problem Solving using C", credits: 4, iaMarks: 26, eaMarks: 71, totalMarks: 97, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "EEE101", subjectName: "Basic Electrical Engineering", credits: 3, iaMarks: 22, eaMarks: 65, totalMarks: 87, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A+", gradePoint: 9 },
        { subjectCode: "MEP101", subjectName: "Engineering Graphics", credits: 2, iaMarks: 27, eaMarks: 66, totalMarks: 93, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "MC101", subjectName: "Constitution of India", credits: 1, iaMarks: 28, eaMarks: 68, totalMarks: 96, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "ENV101", subjectName: "Environmental Studies", credits: 2, iaMarks: 25, eaMarks: 67, totalMarks: 92, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
      ]),
    },
    {
      studentId: student1.id, semester: 2, academicYear: "2021-22", sgpa: 8.42, cgpa: 8.21, status: "pass",
      totalCredits: 24, equivalentPercentage: 73.60, resultDate: "2024-07-15",
      subjects: JSON.stringify([
        { subjectCode: "CS201T", subjectName: "Data Structures", credits: 4, iaMarks: 24, eaMarks: 58, totalMarks: 82, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
        { subjectCode: "MA201T", subjectName: "Discrete Mathematics", credits: 4, iaMarks: 25, eaMarks: 62, totalMarks: 87, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A+", gradePoint: 9 },
        { subjectCode: "EE201T", subjectName: "Basic Electrical Engineering", credits: 4, iaMarks: 21, eaMarks: 55, totalMarks: 76, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "B+", gradePoint: 7 },
        { subjectCode: "CS202T", subjectName: "Digital Logic Design", credits: 4, iaMarks: 22, eaMarks: 57, totalMarks: 79, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
        { subjectCode: "CS203P", subjectName: "Data Structures Lab", credits: 2, iaMarks: 26, eaMarks: 62, totalMarks: 88, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A+", gradePoint: 9 },
        { subjectCode: "EE202P", subjectName: "Electrical Engineering Lab", credits: 2, iaMarks: 24, eaMarks: 60, totalMarks: 84, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
        { subjectCode: "CS204P", subjectName: "Digital Logic Design Lab", credits: 2, iaMarks: 25, eaMarks: 63, totalMarks: 88, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A+", gradePoint: 9 },
        { subjectCode: "HS201T", subjectName: "Technical Communication", credits: 2, iaMarks: 23, eaMarks: 56, totalMarks: 79, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
      ]),
    },
    {
      studentId: student1.id, semester: 3, academicYear: "2022-23", sgpa: 8.7, cgpa: 8.47, status: "pass",
      totalCredits: 24, equivalentPercentage: 83.4, resultDate: "2023-01-10",
      subjects: JSON.stringify([
        { subjectCode: "CS301", subjectName: "Data Structures & Algorithms", credits: 4, iaMarks: 26, eaMarks: 64, totalMarks: 90, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "CS302", subjectName: "Database Management Systems", credits: 4, iaMarks: 28, eaMarks: 68, totalMarks: 96, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
        { subjectCode: "CS303", subjectName: "Operating Systems", credits: 4, iaMarks: 24, eaMarks: 58, totalMarks: 82, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
        { subjectCode: "CS304", subjectName: "Computer Networks", credits: 4, iaMarks: 25, eaMarks: 62, totalMarks: 87, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A+", gradePoint: 9 },
        { subjectCode: "MA301", subjectName: "Mathematics-III", credits: 4, iaMarks: 22, eaMarks: 58, totalMarks: 80, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "A", gradePoint: 8 },
        { subjectCode: "CS305P", subjectName: "Lab Practice", credits: 2, iaMarks: 29, eaMarks: 68, totalMarks: 97, maxIa: 30, maxEa: 70, maxTotal: 100, grade: "O", gradePoint: 10 },
      ]),
    },
  ]);

  await db.insert(examFormsTable).values([
    {
      studentId: student1.id, semester: 4, academicYear: "2024-25", examType: "End Semester", status: "approved",
      subjects: JSON.stringify(["Data Structures & Algorithms", "Database Management Systems", "Operating Systems", "Computer Networks", "Mathematics-IV"]),
      remarks: "All dues cleared", approvedBy: "Dr. Ramesh Kumar",
    },
  ]);

  await db.insert(notificationsTable).values([
    { title: "End Semester Exam Schedule Released", message: "The end semester examination schedule for Semester 4 (2024-25) has been released. Exams begin from December 1, 2024.", targetRole: "student", priority: "urgent", createdBy: "Admin" },
    { title: "Fee Payment Reminder", message: "Students with pending semester fees are requested to clear their dues before November 30, 2024 to avoid late fee charges.", targetRole: "student", priority: "important", createdBy: "Accounts Office" },
    { title: "Republic Day Celebration", message: "Alliance University will celebrate Republic Day on 26th January 2025. All students and staff are invited to attend the flag hoisting ceremony at 9:00 AM.", targetRole: "all", priority: "normal", createdBy: "Admin" },
    { title: "Library Books Return Notice", message: "All students are requested to return borrowed library books before December 15, 2024.", targetRole: "student", priority: "normal", createdBy: "Library" },
    { title: "Faculty Development Program", message: "A Faculty Development Program on 'AI in Education' is scheduled from November 25–27, 2024.", targetRole: "staff", priority: "important", createdBy: "Admin" },
    { title: "Sports Day Registration Open", message: "Annual Sports Day 2024 registrations are now open. Register at the Sports Office.", targetRole: "student", priority: "normal", createdBy: "Sports Department" },
    { title: "Upcoming Mid-Semester Exams Scheduled", message: "Mid-Semester Exams scheduled from 13th May 2024. Program is Cordially invited to all students.", targetRole: "student", priority: "important", createdBy: "Exam Cell" },
    { title: "Last Date for Fee Payment", message: "Last date for payment of pending fees is 3rd in April 2024. Please clear dues immediately.", targetRole: "student", priority: "urgent", createdBy: "Accounts" },
  ]);

  await db.insert(calendarEventsTable).values([
    { title: "Independence Day", description: "National Holiday", startDate: "2024-08-15", eventType: "holiday", createdBy: "Admin" },
    { title: "Gandhi Jayanti", description: "National Holiday", startDate: "2024-10-02", eventType: "holiday", createdBy: "Admin" },
    { title: "Diwali Break", description: "Festival Holiday", startDate: "2024-11-01", endDate: "2024-11-05", eventType: "holiday", createdBy: "Admin" },
    { title: "Mid-Semester Exams", description: "Mid-semester examinations for all semesters", startDate: "2024-09-23", endDate: "2024-09-30", eventType: "exam", createdBy: "Exam Cell" },
    { title: "End Semester Exams", description: "End semester examinations — Semester 4", startDate: "2024-12-01", endDate: "2024-12-20", eventType: "exam", createdBy: "Exam Cell" },
    { title: "Exam Form Submission Deadline", description: "Last date to submit end semester exam forms", startDate: "2024-11-15", eventType: "deadline", createdBy: "Exam Cell" },
    { title: "Fee Payment Last Date", description: "Last date to pay semester fees without late fine", startDate: "2024-11-30", eventType: "deadline", createdBy: "Accounts Office" },
    { title: "Annual Tech Fest – AllianceFest 2024", description: "Annual technical and cultural festival", startDate: "2024-10-18", endDate: "2024-10-20", eventType: "event", createdBy: "Student Council" },
    { title: "Annual Sports Day", description: "Inter-department sports competition", startDate: "2024-11-22", eventType: "event", createdBy: "Sports Department" },
    { title: "Winter Break", description: "Winter vacation", startDate: "2024-12-22", endDate: "2025-01-05", eventType: "holiday", createdBy: "Admin" },
    { title: "Republic Day", description: "National Holiday", startDate: "2025-01-26", eventType: "holiday", createdBy: "Admin" },
    { title: "Result Declaration", description: "Semester 4 result declaration", startDate: "2025-01-15", eventType: "announcement", createdBy: "Exam Cell" },
    { title: "April/May 2024 Examination Timetable Released", description: "Examination timetable for April/May 2024 has been released. Check the notice board.", startDate: "2024-04-12", eventType: "announcement", createdBy: "Exam Cell" },
    { title: "Project Viva Schedule – Final Year", description: "Project viva schedule for final year students announced.", startDate: "2024-04-10", eventType: "announcement", createdBy: "Exam Cell" },
    { title: "Internship Registration Open", description: "Internship registration open for 3rd and 4th year students.", startDate: "2024-04-06", eventType: "announcement", createdBy: "Placement Cell" },
    { title: "Holiday on May Day", description: "Public Holiday", startDate: "2024-05-01", eventType: "holiday", createdBy: "Admin" },
  ]);

  console.log("✅ Seeding complete!");
  console.log("");
  console.log("Demo Credentials:");
  console.log("  Student : barelanilesh483@gmail.com / Nilu@2006");
  console.log("  Staff   : ramesh.kumar@alliance.edu / Staff@2024");
  console.log("  Admin   : admin@alliance.edu        / Admin@2024");
}

seed()
  .catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); })
  .finally(() => process.exit(0));
