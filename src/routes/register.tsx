import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Smart Assignment Planner AI" },
      { name: "description", content: "Create your free Smart Planner student account." },
      { property: "og:title", content: "Create account — Smart Planner" },
      { property: "og:description", content: "Sign up for free and start planning." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !password || !trimmedName) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(trimmedEmail, password, trimmedName);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever for students."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required placeholder="Alex Student" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
