import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Lock, Pencil } from "lucide-react";
import { CaptchaWidget, CaptchaHandle } from "@/components/auth/captcha-widget";
import { AuLogo } from "./au-logo";
import { useBranding } from "@/contexts/branding-context";

const DEMO = [
  { label: "Faculty/Staff Login", user: "teacher@alliance.edu.in", pass: "password123" },
];

export function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const captchaRef = useRef<CaptchaHandle>(null);
  const branding = useBranding();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/staff/dashboard");
      },
      onError: () => {
        setError("Invalid email or password. Please try again.");
        captchaRef.current?.refresh();
        setCaptchaInput("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!captchaInput) { setError("Please enter Captcha code."); return; }
    if (!captchaRef.current?.validate(captchaInput)) {
      setError("Incorrect captcha code. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }
    if (!username || !password) { setError("Please enter email and password."); return; }
    loginMutation.mutate({ data: { username, password, role: "staff" as LoginInputRole } });
  };

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setCaptchaInput("");
    setError("");
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-between"
      style={{
        backgroundImage: `url(${branding.staff_login_bg ?? "/campus-bg2.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-full flex justify-center pt-4">
        <AuLogo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-[340px] shadow-2xl" style={{ background: "rgba(255,255,255,0.95)" }}>
          <div className="px-7 pt-6 pb-7">
            <p className="text-center text-xs font-medium mb-0.5" style={{ color: "#1a6fc4" }}>Welcome to AUERP</p>
            <h2 className="text-center mb-5" style={{ fontSize: "1.15rem", fontFamily: "Georgia, serif", fontWeight: 400, color: "#333" }}>
              Faculty | Staff Login
            </h2>

            {error && (
              <div className="mb-3 py-2 text-center text-white text-xs" style={{ background: "#c00" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="email"
                  placeholder="Email ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 pl-3 pr-2 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="email"
                />
                <span className="pr-2.5 text-gray-400"><Mail className="w-3.5 h-3.5" /></span>
              </div>

              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 pl-3 pr-2 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="current-password"
                />
                <span className="pr-2.5 text-gray-400"><Lock className="w-3.5 h-3.5" /></span>
              </div>

              <CaptchaWidget ref={captchaRef} />

              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 pl-3 pr-2 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="off"
                />
                <span className="pr-2.5 text-gray-400"><Pencil className="w-3.5 h-3.5" /></span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a href="#" onClick={(e) => e.preventDefault()} className="text-sm" style={{ color: "#1a6fc4" }}>
                  Forgot Password
                </a>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="text-white text-sm px-6 py-2 disabled:opacity-60"
                  style={{ background: "#1a6fc4" }}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[340px] mx-auto px-4 pb-2">
        <div className="text-center text-white text-xs mb-1 font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
          Demo Credentials
        </div>
        {DEMO.map((d) => (
          <button
            key={d.user}
            onClick={() => fillDemo(d.user, d.pass)}
            className="w-full text-left text-white text-xs py-1 px-2 hover:bg-white/10 rounded transition-colors"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
          >
            <span className="font-semibold">{d.label}:</span> {d.user} / {d.pass}
          </button>
        ))}
      </div>

      <div className="relative z-10 text-center text-white text-xs py-3" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        <p>Copyright © 2026 Alliance University. All rights reserved.</p>
      </div>
    </div>
  );
}
