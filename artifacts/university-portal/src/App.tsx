import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { BrandingProvider } from "@/contexts/branding-context";
import NotFound from "@/pages/not-found";

// Layout
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Auth Pages
import { StudentLogin } from "@/pages/auth/student-login";
import { StaffLogin } from "@/pages/auth/staff-login";
import { AdminLogin } from "@/pages/auth/admin-login";

// Student Pages
import { StudentDashboard } from "@/pages/student/student-dashboard";
import { FeesPage } from "@/pages/student/fees";
import { FeeReceiptPage } from "@/pages/student/fee-receipt";
import { AttendancePage } from "@/pages/student/attendance";
import { ResultsPage } from "@/pages/student/results";
import { ExamFormsPage } from "@/pages/student/exam-forms";
import { HallTicketPage } from "@/pages/student/hall-ticket";
import { NotificationsPage } from "@/pages/student/notifications";
import { CalendarPage } from "@/pages/student/calendar";
import { ProfilePage } from "@/pages/student/profile";
import { IdCardPage } from "@/pages/student/id-card";
import { DocumentsPage } from "@/pages/student/documents";

// Staff Pages
import { StaffDashboard } from "@/pages/staff/staff-dashboard";
import { StaffStudentsPage } from "@/pages/staff/students";
import { StaffExamFormsPage } from "@/pages/staff/exam-forms";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/admin-dashboard";
import { AdminStudentsPage } from "@/pages/admin/students";
import { AdminStaffPage } from "@/pages/admin/staff";
import { AdminFeesPage } from "@/pages/admin/fees";
import { AdminExamFormsPage } from "@/pages/admin/exam-forms";
import { AdminNotificationsPage } from "@/pages/admin/notifications";
import { AdminBrandingPage } from "@/pages/admin/branding";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30000,
    }
  }
});

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/" component={StudentLogin} />
      <Route path="/login" component={StudentLogin} />
      <Route path="/staff" component={StaffLogin} />
      <Route path="/admin" component={AdminLogin} />

      {/* Student Routes */}
      <Route path="/student/dashboard">
        <DashboardLayout role="student"><StudentDashboard /></DashboardLayout>
      </Route>
      <Route path="/student/profile">
        <DashboardLayout role="student"><ProfilePage /></DashboardLayout>
      </Route>
      <Route path="/student/fees/:id/receipt">
        <DashboardLayout role="student"><FeeReceiptPage /></DashboardLayout>
      </Route>
      <Route path="/student/fees">
        <DashboardLayout role="student"><FeesPage /></DashboardLayout>
      </Route>
      <Route path="/student/attendance">
        <DashboardLayout role="student"><AttendancePage /></DashboardLayout>
      </Route>
      <Route path="/student/results">
        <DashboardLayout role="student"><ResultsPage /></DashboardLayout>
      </Route>
      <Route path="/student/exam-forms">
        <DashboardLayout role="student"><ExamFormsPage /></DashboardLayout>
      </Route>
      <Route path="/student/hall-ticket">
        <DashboardLayout role="student"><HallTicketPage /></DashboardLayout>
      </Route>
      <Route path="/student/id-card">
        <DashboardLayout role="student"><IdCardPage /></DashboardLayout>
      </Route>
      <Route path="/student/documents">
        <DashboardLayout role="student"><DocumentsPage /></DashboardLayout>
      </Route>
      <Route path="/student/calendar">
        <DashboardLayout role="student"><CalendarPage /></DashboardLayout>
      </Route>
      <Route path="/student/notifications">
        <DashboardLayout role="student"><NotificationsPage /></DashboardLayout>
      </Route>

      {/* Staff Routes */}
      <Route path="/staff/dashboard">
        <DashboardLayout role="staff"><StaffDashboard /></DashboardLayout>
      </Route>
      <Route path="/staff/students">
        <DashboardLayout role="staff"><StaffStudentsPage /></DashboardLayout>
      </Route>
      <Route path="/staff/exam-forms">
        <DashboardLayout role="staff"><StaffExamFormsPage /></DashboardLayout>
      </Route>
      <Route path="/staff/calendar">
        <DashboardLayout role="staff"><CalendarPage /></DashboardLayout>
      </Route>
      <Route path="/staff/notifications">
        <DashboardLayout role="staff"><NotificationsPage /></DashboardLayout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>
      </Route>
      <Route path="/admin/students">
        <DashboardLayout role="admin"><AdminStudentsPage /></DashboardLayout>
      </Route>
      <Route path="/admin/staff">
        <DashboardLayout role="admin"><AdminStaffPage /></DashboardLayout>
      </Route>
      <Route path="/admin/fees">
        <DashboardLayout role="admin"><AdminFeesPage /></DashboardLayout>
      </Route>
      <Route path="/admin/results">
        <DashboardLayout role="admin">
          <div className="p-8"><h1 className="text-2xl font-bold">Results — Coming Soon</h1></div>
        </DashboardLayout>
      </Route>
      <Route path="/admin/exam-forms">
        <DashboardLayout role="admin"><AdminExamFormsPage /></DashboardLayout>
      </Route>
      <Route path="/admin/calendar">
        <DashboardLayout role="admin"><CalendarPage /></DashboardLayout>
      </Route>
      <Route path="/admin/notifications">
        <DashboardLayout role="admin"><AdminNotificationsPage /></DashboardLayout>
      </Route>
      <Route path="/admin/branding">
        <DashboardLayout role="admin"><AdminBrandingPage /></DashboardLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <BrandingProvider>
              <Router />
            </BrandingProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
