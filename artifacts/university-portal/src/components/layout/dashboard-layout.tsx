import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ProtectedRoute, useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, User, CreditCard, ClipboardList,
  Calendar, FileText, Bell, LogOut, Users, Receipt,
  BookOpen, IdCard, FolderOpen, Palette, Ticket
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { useBranding } from "@/contexts/branding-context";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const getNavItems = (role: string): NavItem[] => {
  if (role === "student") {
    return [
      { label: "Dashboard",    href: "/student/dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Profile",      href: "/student/profile",     icon: <User className="w-4 h-4" /> },
      { label: "Fees",         href: "/student/fees",        icon: <CreditCard className="w-4 h-4" /> },
      { label: "Exam Forms",   href: "/student/exam-forms",  icon: <BookOpen className="w-4 h-4" /> },
      { label: "Hall Ticket",  href: "/student/hall-ticket", icon: <Ticket className="w-4 h-4" /> },
      { label: "Attendance",   href: "/student/attendance",  icon: <ClipboardList className="w-4 h-4" /> },
      { label: "Results",      href: "/student/results",     icon: <FileText className="w-4 h-4" /> },
      { label: "Notifications",href: "/student/notifications",icon: <Bell className="w-4 h-4" /> },
      { label: "ID Card",      href: "/student/id-card",     icon: <IdCard className="w-4 h-4" /> },
      { label: "Documents",    href: "/student/documents",   icon: <FolderOpen className="w-4 h-4" /> },
      { label: "Calendar",     href: "/student/calendar",    icon: <Calendar className="w-4 h-4" /> },
    ];
  }
  if (role === "staff") {
    return [
      { label: "Dashboard",    href: "/staff/dashboard",     icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Students",     href: "/staff/students",      icon: <Users className="w-4 h-4" /> },
      { label: "Attendance",   href: "/staff/attendance",    icon: <ClipboardList className="w-4 h-4" /> },
      { label: "Exam Forms",   href: "/staff/exam-forms",    icon: <FileText className="w-4 h-4" /> },
      { label: "Calendar",     href: "/staff/calendar",      icon: <Calendar className="w-4 h-4" /> },
      { label: "Notifications",href: "/staff/notifications", icon: <Bell className="w-4 h-4" /> },
    ];
  }
  if (role === "admin") {
    return [
      { label: "Dashboard",    href: "/admin/dashboard",     icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Students",     href: "/admin/students",      icon: <Users className="w-4 h-4" /> },
      { label: "Staff",        href: "/admin/staff",         icon: <Users className="w-4 h-4" /> },
      { label: "Fees",         href: "/admin/fees",          icon: <CreditCard className="w-4 h-4" /> },
      { label: "Results",      href: "/admin/results",       icon: <Receipt className="w-4 h-4" /> },
      { label: "Exam Forms",   href: "/admin/exam-forms",    icon: <FileText className="w-4 h-4" /> },
      { label: "Calendar",     href: "/admin/calendar",      icon: <Calendar className="w-4 h-4" /> },
      { label: "Notifications",href: "/admin/notifications", icon: <Bell className="w-4 h-4" /> },
      { label: "Branding",     href: "/admin/branding",      icon: <Palette className="w-4 h-4" /> },
    ];
  }
  return [];
};

export function DashboardLayout({ children, role }: { children: ReactNode; role: "student" | "staff" | "admin" }) {
  const [location] = useLocation();
  const navItems = getNavItems(role);
  const { user } = useAuth();
  const branding = useBranding();

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.href = `/${role === "student" ? "login" : role}`;
      },
    },
  });

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* SIDEBAR */}
        <aside className="w-56 bg-sidebar text-sidebar-foreground hidden md:flex flex-col no-print shrink-0">

          {/* Logo */}
          <div className="px-3 pt-3 pb-3 border-b border-sidebar-border">
            <img
              src={branding.logo_horizontal ?? "/au-logo-horizontal.png"}
              alt="Alliance University"
              className="object-contain w-full"
              style={{ maxHeight: 44 }}
            />
          </div>

          {/* User profile */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-sidebar-accent-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-xs truncate">{user?.name}</p>
                <p className="text-sidebar-foreground/60 text-[10px] uppercase tracking-wider">{role}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer transition-colors text-sm ${
                  location === item.href || location.startsWith(item.href + "/")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-sidebar-border">
            <button
              onClick={() => logout.mutate()}
              className="flex items-center gap-2.5 px-3 py-2 w-full rounded cursor-pointer transition-colors text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
            <p className="text-center text-sidebar-foreground/30 text-[9px] mt-2">© 2026 Alliance University</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile header */}
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden no-print">
            <div className="flex items-center gap-2">
              <img
                src={branding.logo_horizontal ?? "/au-logo-horizontal.png"}
                alt="Alliance University"
                className="object-contain"
                style={{ height: 32, maxWidth: 180 }}
              />
            </div>
            <button onClick={() => logout.mutate()} className="p-2 text-gray-500">
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
