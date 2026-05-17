import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Lock, Pencil } from "lucide-react";
import { CaptchaWidget, CaptchaHandle } from "@/components/auth/captcha-widget";
import { AuLogo } from "./au-logo";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const captchaRef = useRef<CaptchaHandle>(null);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        setError("Invalid credentials. Access denied.");
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
    if (!username || !password) { setError("Please enter admin ID and password."); return; }
    loginMutation.mutate({ data: { username, password, role: "admin" as LoginInputRole } });
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-between py-5"
      style={{ backgroundImage: "url(/campus-bg2.jpg)", backgroundSize: "cover", backgroundPosition: "center top" }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full flex justify-center pt-1">
        <AuLogo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-[360px] shadow-2xl" style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(4px)" }}>
          <div className="px-8 py-7">
            <p className="text-center text-[0.78rem] text-blue-500 font-medium tracking-wide mb-0.5">Welcome to AUERP</p>
            <h2 className="text-center text-xl font-normal text-gray-800 mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Admin Login
            </h2>

            {error && (
              <div className="mb-3 bg-red-500 text-white text-xs px-3 py-2 text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="text"
                  placeholder="Admin ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 pl-3 pr-9 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="username"
                />
                <span className="pr-2.5 text-gray-400"><User className="w-4 h-4" /></span>
              </div>

              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 pl-3 pr-9 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="current-password"
                />
                <span className="pr-2.5 text-gray-400"><Lock className="w-4 h-4" /></span>
              </div>

              <CaptchaWidget ref={captchaRef} />

              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 pl-3 pr-9 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="off"
                />
                <span className="pr-2.5 text-gray-400"><Pencil className="w-4 h-4" /></span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-500 hover:text-blue-700 text-sm">
                  Forgot Password
                </a>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 transition-colors disabled:opacity-60"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-white text-xs py-3" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        <p>Copyright © 2026 Alliance University</p>
        <p>All rights reserved.</p>
      </div>
    </div>
  );
}
