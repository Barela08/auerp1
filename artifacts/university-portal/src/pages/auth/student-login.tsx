import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Lock, Type, Eye, EyeOff } from "lucide-react";
import { CaptchaWidget, CaptchaHandle } from "@/components/auth/captcha-widget";
import { AuLogo } from "./au-logo";

export function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const captchaRef = useRef<CaptchaHandle>(null);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/student/dashboard");
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
    if (!username || !password) { setError("Please enter username and password."); return; }
    if (!captchaInput) { setError("Please enter the captcha code."); return; }
    if (!captchaRef.current?.validate(captchaInput)) {
      setError("Incorrect captcha. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }
    loginMutation.mutate({ data: { username, password, role: "student" as LoginInputRole } });
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-between py-5"
      style={{ backgroundImage: "url(/campus-bg1.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/5" />

      <div className="relative z-10 w-full flex justify-center pt-1">
        <AuLogo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-[360px] shadow-2xl" style={{ background: "rgba(255,255,255,0.87)", backdropFilter: "blur(4px)" }}>
          <div className="px-8 py-7">
            <h2 className="text-center text-xl font-normal text-gray-800 mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Student Login
            </h2>

            {error && (
              <div className="mb-3 bg-red-500 text-white text-xs px-3 py-2 text-center rounded-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="User Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 px-2.5 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="username"
                />
              </div>

              <div className="relative flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400"><Lock className="w-4 h-4" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-2.5 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-2.5 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <CaptchaWidget ref={captchaRef} />

              <div className="relative flex items-center border border-gray-300 bg-white">
                <span className="pl-2.5 text-gray-400"><Type className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 px-2.5 py-2.5 text-sm bg-transparent focus:outline-none"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 transition-colors disabled:opacity-60"
                >
                  {loginMutation.isPending ? "Logging in..." : <>Login <span className="text-base">&#8594;</span></>}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center text-sm text-gray-600">
              Forgot your password ?{" "}
              <span className="text-gray-500 text-xs">no worries,</span>{" "}
              <a href="#" onClick={(e) => e.preventDefault()}
                className="inline-block bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 transition-colors">
                click here
              </a>{" "}
              <span className="text-gray-500 text-xs">to reset your password.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-white text-xs py-3" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        <p>Copyright © 2026 · Alliance University.</p>
        <p>All rights reserved</p>
      </div>
    </div>
  );
}
