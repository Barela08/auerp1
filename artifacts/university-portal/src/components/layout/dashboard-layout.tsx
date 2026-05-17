import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ProtectedRoute, useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, User, CreditCard, ClipboardList, 
  Calendar, FileText, Bell, LogOut, Users, Settings
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const getNavItems = (role: string): NavItem[] => {
  if (role === "student") {
    return [
      { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "My Profile", href: "/student/profile", icon: <User className="w-5 h-5" /> },
      { label: "Fee Details", href: "/student/fees", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Attendance", href: "/student/attendance", icon: <ClipboardList className="w-5 h-5" /> },
      { label: "Results", href: "/student/results", icon: <FileText className="w-5 h-5" /> },
      { label: "Exam Forms", href: "/student/exam-forms", icon: <FileText className="w-5 h-5" /> },
      { label: "Hall Ticket", href: "/student/hall-ticket", icon: <FileText className="w-5 h-5" /> },
      { label: "ID Card", href: "/student/documents", icon: <User className="w-5 h-5" /> },
      { label: "Calendar", href: "/student/calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Notifications", href: "/student/notifications", icon: <Bell className="w-5 h-5" /> },
    ];
  }
  if (role === "staff") {
    return [
      { label: "Dashboard", href: "/staff/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Students", href: "/staff/students", icon: <Users className="w-5 h-5" /> },
      { label: "Mark Attendance", href: "/staff/attendance", icon: <ClipboardList className="w-5 h-5" /> },
      { label: "Exam Forms", href: "/staff/exam-forms", icon: <FileText className="w-5 h-5" /> },
      { label: "Calendar", href: "/staff/calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Notifications", href: "/staff/notifications", icon: <Bell className="w-5 h-5" /> },
    ];
  }
  if (role === "admin") {
    return [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Students", href: "/admin/students", icon: <Users className="w-5 h-5" /> },
      { label: "Staff", href: "/admin/staff", icon: <Users className="w-5 h-5" /> },
      { label: "Fees", href: "/admin/fees", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Results", href: "/admin/results", icon: <FileText className="w-5 h-5" /> },
      { label: "Exam Forms", href: "/admin/exam-forms", icon: <FileText className="w-5 h-5" /> },
      { label: "Calendar", href: "/admin/calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
    ];
  }
  return [];
};

export function DashboardLayout({ children, role }: { children: ReactNode, role: "student" | "staff" | "admin" }) {
  const [location, setLocation] = useLocation();
  const navItems = getNavItems(role);
  const { user } = useAuth();
  
  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.href = `/${role === 'student' ? 'login' : role}`;
      }
    }
  });

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar text-sidebar-foreground hidden md:flex flex-col no-print">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold font-serif text-white tracking-wide">Alliance University</h1>
          </div>
          
          <div className="p-6 border-b border-sidebar-border flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-sidebar-accent flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-sidebar-accent-foreground" />
            </div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-sidebar-foreground/70 uppercase tracking-wider mt-1">{role}</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  location.startsWith(item.href) 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-sidebar-border">
            <button 
              onClick={() => logout.mutate()}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md cursor-pointer transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden no-print">
            <h1 className="text-lg font-bold font-serif text-primary">Alliance University</h1>
            <button onClick={() => logout.mutate()} className="p-2 text-gray-500 hover:text-gray-900">
              <LogOut className="w-5 h-5" />
            </button>
          </header>
          
          <div className="flex-1 overflow-auto bg-gray-50/50">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
