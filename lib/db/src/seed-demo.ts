import { db } from "./index";
import { usersTable, studentsTable, staffTable } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding demo users...");

  // 1. Student record
  let studentId: number;
  const existingStudent = await db.select().from(studentsTable).where(eq(studentsTable.email, "barelanilesh483@gmail.com"));
  if (existingStudent[0]) {
    studentId = existingStudent[0].id;
    console.log("Student record already exists:", studentId);
  } else {
    const [student] = await db.insert(studentsTable).values({
      name: "Nilesh Barela",
      enrollmentNo: "RTUBETCH-CS/2024-25/020",
      rollNo: "CS24020",
      admissionNo: "AU2024020",
      program: "B.Tech",
      department: "Computer Science & Engineering",
      semester: 2,
      section: "A",
      academicYear: "2024-25",
      email: "barelanilesh483@gmail.com",
      phone: "9876543210",
      fatherName: "Ramesh Barela",
      motherName: "Sunita Barela",
      dob: "2006-05-15",
      address: "Bangalore, Karnataka",
      cgpa: 8.5,
    }).returning();
    studentId = student.id;
    console.log("Created student:", studentId);
  }

  // 2. Staff record
  let staffId: number;
  const existingStaff = await db.select().from(staffTable).where(eq(staffTable.email, "teacher@alliance.edu.in"));
  if (existingStaff[0]) {
    staffId = existingStaff[0].id;
    console.log("Staff record already exists:", staffId);
  } else {
    const [staff] = await db.insert(staffTable).values({
      name: "Dr. Priya Sharma",
      employeeId: "EMP001",
      department: "Computer Science & Engineering",
      designation: "Assistant Professor",
      email: "teacher@alliance.edu.in",
      phone: "9876540001",
    }).returning();
    staffId = staff.id;
    console.log("Created staff:", staffId);
  }

  // 3. Upsert demo users
  const users = [
    {
      username: "barelanilesh483@gmail.com",
      email: "barelanilesh483@gmail.com",
      passwordHash: "Nilu@2006",
      role: "student" as const,
      name: "Nilesh Barela",
      studentId,
    },
    {
      username: "teacher@alliance.edu.in",
      email: "teacher@alliance.edu.in",
      passwordHash: "password123",
      role: "staff" as const,
      name: "Dr. Priya Sharma",
      staffId,
    },
    {
      username: "admin@alliance.edu.in",
      email: "admin@alliance.edu.in",
      passwordHash: "password123",
      role: "admin" as const,
      name: "Admin",
    },
  ];

  for (const userData of users) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, userData.email));
    if (existing[0]) {
      await db.update(usersTable)
        .set({ passwordHash: userData.passwordHash, name: userData.name })
        .where(eq(usersTable.email, userData.email));
      console.log(`Updated user: ${userData.email}`);
    } else {
      await db.insert(usersTable).values(userData);
      console.log(`Created user: ${userData.email}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
