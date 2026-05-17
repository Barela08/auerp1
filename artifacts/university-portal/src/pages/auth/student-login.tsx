import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Lock, Eye, EyeOff, RotateCcw } from "lucide-react";
import { CaptchaWidget, CaptchaHandle } from "@/components/auth/captcha-widget";
import { AuLogo } from "./au-logo";
import { useBranding } from "@/contexts/branding-context";

const DEMO = [
  { label: "Student Login", user: "barelanilesh483@gmail.com", pass: "Nilu@2006" },
];

export function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const captchaRef = useRef<CaptchaHandle>(null);
  const branding = useBranding();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/student/dashboard");
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
    if (!username || !password) { setError("Please enter email and password."); return; }
    if (!captchaInput) { setError("Please enter the captcha code."); return; }
    if (!captchaRef.current?.validate(captchaInput)) {
      setError("Incorrect captcha. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }
    loginMutation.mutate({ data: { username, password, role: "student" as LoginInputRole } });
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
        backgroundImage: `url(${branding.student_login_bg ?? "/campus-bg1.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-full flex justify-center pt-4">
        <AuLogo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-[340px]" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(2px)" }}>
          <div className="px-7 pt-6 pb-7">
            <h2 className="text-center mb-5" style={{ fontSize: "1.15rem", fontFamily: "Georgia, serif", fontWeight: 400, color: "#333" }}>
              Student Login
            </h2>

            {error && (
              <div className="mb-3 py-2 text-center text-white text-xs" style={{ background: "#c00" }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400"><Mail className="w-3.5 h-3.5" /></span>
                <input
                  type="email"
                  placeholder="Email ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 pl-2 pr-3 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="email"
                />
              </div>

              <div className="flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400"><Lock className="w-3.5 h-3.5" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 pl-2 pr-2 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-2 text-gray-400">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <CaptchaWidget ref={captchaRef} />
              </div>

              <div className="flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400 font-bold text-xs">A</span>
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 pl-2 pr-3 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="flex items-center gap-1.5 text-white text-sm px-5 py-2 disabled:opacity-60"
                  style={{ background: "#1a6fc4" }}
                >
                  {loginMutation.isPending ? "Logging in..." : (
                    <>Login <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/60 text-xs">→</span></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 text-sm text-gray-700">
              Forgot your password ?{" "}
              <span className="text-gray-500 text-xs">no worries,</span>{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); }}
                className="inline-block text-white text-xs px-2 py-0.5"
                style={{ background: "#4caf50" }}
              >
                click here
              </a>{" "}
              <span className="text-gray-500 text-xs">to reset your password.</span>
            </div>
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
        <p>Copyright © 2026 · Alliance University. All rights reserved</p>
      </div>
    </div>
  );
}
