import { createContext, useContext, ReactNode } from "react";
import { useGetMe, AuthUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({ query: { retry: false, queryKey: ["me"] } });

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading, isError } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (isError || !user) {
    // Redirect to login if not authenticated
    // If not authenticated, we could check the URL to see which login to send them to, 
    // but default to /login for students
    setLocation("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect if role is not allowed
    if (user.role === "student") setLocation("/student/dashboard");
    if (user.role === "staff") setLocation("/staff/dashboard");
    if (user.role === "admin") setLocation("/admin/dashboard");
    return null;
  }

  return <>{children}</>;
}
