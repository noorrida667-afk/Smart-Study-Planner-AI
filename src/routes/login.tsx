import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Smart Assignment Planner AI" },
      { name: "description", content: "Log in to your Smart Planner account." },
      { property: "og:title", content: "Log in — Smart Planner" },
      { property: "og:description", content: "Access your assignments and study plans." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(trimmedEmail, password);
    setLoading(false);
    if (error) {
      const msg = error.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        toast.error("Please check your email to confirm your account before logging in.");
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else {
        toast.error(error);
      }
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue planning your semester."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
