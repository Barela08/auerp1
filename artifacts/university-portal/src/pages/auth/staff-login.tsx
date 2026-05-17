import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Lock, Pencil } from "lucide-react";
import { CaptchaWidget, CaptchaHandle } from "@/components/auth/captcha-widget";
import { AuLogo } from "./au-logo";

export function StaffLogin() {
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
        setLocation("/staff/dashboard");
      },
      onError: () => {
        setError("Invalid username or password. Please try again.");
        captchaRef.current?.refresh();
        setCaptchaInput("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!captchaInput) {
      setError("Please enter Captcha code.");
      return;
    }
    if (!captchaRef.current?.validate(captchaInput)) {
      setError("Incorrect captcha code. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    loginMutation.mutate({ data: { username, password, role: "staff" as LoginInputRole } });
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-between py-6"
      style={{
        backgroundImage: "url(/campus-staff.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex flex-col items-center w-full">
        <AuLogo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-4">
        <div
          className="w-full max-w-sm rounded-sm shadow-2xl"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)" }}
        >
          <div className="px-8 py-7">
            <p className="text-center text-[0.8rem] text-blue-500 font-medium mb-0.5 tracking-wide">
              Welcome to AUERP
            </p>
            <h2 className="text-center text-[1.2rem] font-normal text-gray-800 mb-5 tracking-wide">
              Faculty | Staff Login
            </h2>

            {error && (
              <div className="mb-4 bg-red-500 text-white text-sm px-3 py-2 rounded text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="User Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="username"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="current-password"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CaptchaWidget ref={captchaRef} />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="off"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Pencil className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="#"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password
                </a>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-sm transition-colors disabled:opacity-60"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-white text-xs py-3 drop-shadow-sm">
        <p>Copyright © 2026 Alliance University</p>
        <p>All rights reserved.</p>
      </div>
    </div>
  );
}
