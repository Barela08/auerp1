import { ReactNode } from "react";
import { Link } from "wouter";

export function LoginLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 bg-sidebar flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md w-full text-center md:text-left">
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto md:mx-0 mb-8 border-4 border-sidebar-accent shadow-2xl">
            <span className="text-4xl font-serif font-bold">AU</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Alliance University</h1>
          <p className="text-lg md:text-xl text-sidebar-foreground/80 font-light border-l-4 border-sidebar-primary pl-4">
            Official Academic Portal
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          
          {children}

          <div className="mt-12 pt-6 border-t border-gray-100 flex justify-center gap-6 text-sm">
            <Link href="/login">
              <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Student</span>
            </Link>
            <Link href="/staff">
              <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Staff</span>
            </Link>
            <Link href="/admin">
              <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
