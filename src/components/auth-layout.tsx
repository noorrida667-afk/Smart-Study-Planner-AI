import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Smart Planner</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Study smarter,
              <br /> not harder.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              The planner that helps university students track every deadline and prepare for every exam with confidence.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Smart Assignment Planner AI</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Smart Planner</span>
          </Link>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
