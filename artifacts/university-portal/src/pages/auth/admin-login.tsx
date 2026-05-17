import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, LoginInputRole } from "@workspace/api-client-react";
import { LoginLayout } from "./login-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Login successful", description: "Admin access granted." });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid credentials. Please try again.", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate({
      data: {
        username,
        password,
        role: "admin" as LoginInputRole
      }
    });
  };

  return (
    <LoginLayout 
      title="System Administration" 
      subtitle="Sign in with your administrator credentials"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Admin Username</Label>
          <Input 
            id="username" 
            placeholder="admin" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 border-primary/20 focus-visible:ring-primary"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 border-primary/20 focus-visible:ring-primary"
            autoComplete="current-password"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium" 
          disabled={loginMutation.isPending || !username || !password}
        >
          {loginMutation.isPending ? "Authenticating..." : "Sign In to Admin Console"}
        </Button>
      </form>
    </LoginLayout>
  );
}
