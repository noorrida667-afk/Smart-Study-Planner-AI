import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Smart Assignment Planner AI" },
      { name: "description", content: "Reset your Smart Planner password." },
      { property: "og:title", content: "Forgot password — Smart Planner" },
      { property: "og:description", content: "We'll email you a reset link." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Back to log in</Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          const { error } = await resetPassword(email);
          setLoading(false);
          if (error) toast.error(error);
          else toast.success("If that email exists, a reset link is on its way.");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
