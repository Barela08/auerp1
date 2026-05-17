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
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    if (!captchaInput) {
      setError("Please enter the captcha code.");
      return;
    }
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
      className="min-h-screen w-full relative flex flex-col items-center justify-between py-6"
      style={{
        backgroundImage: "url(/campus-student.jpg)",
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
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}
        >
          <div className="px-8 py-7">
            <h2 className="text-center text-[1.35rem] font-normal text-gray-800 mb-6 tracking-wide">
              Student Login
            </h2>

            {error && (
              <div className="mb-4 bg-red-500 text-white text-sm px-3 py-2 rounded text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="User Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <CaptchaWidget ref={captchaRef} />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Type className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Type the text above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-sm text-sm bg-white focus:outline-none focus:border-blue-400"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-sm transition-colors disabled:opacity-60"
                >
                  {loginMutation.isPending ? "Logging in..." : <>Login <span>&#8594;</span></>}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center text-sm text-gray-600">
              Forgot your password ?{" "}
              <span className="text-gray-500">no worries,</span>{" "}
              <a
                href="#"
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                click here
              </a>{" "}
              <span className="text-gray-500">to reset your password.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-white text-xs py-3 drop-shadow-sm">
        <p>Copyright © 2026 · Alliance University.</p>
        <p>All rights reserved</p>
      </div>
    </div>
  );
}
