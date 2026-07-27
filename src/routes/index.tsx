import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Assignment Planner AI — For University Students" },
      {
        name: "description",
        content:
          "Track deadlines, plan study sessions, and stay on top of every assignment with the smart planner built for students.",
      },
      { property: "og:title", content: "Smart Assignment Planner AI" },
      {
        property: "og:description",
        content: "The intelligent planner built for university students.",
      },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Smart Planner</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Students</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/register"><Button size="sm" className="bg-gradient-primary shadow-elegant">Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered study planning
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Organize every assignment.
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Own every deadline.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Smart Assignment Planner AI helps university students track homework, plan study sessions, and prepare for exams — all in one clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary shadow-elegant transition-transform hover:-translate-y-0.5">
                  Start planning free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">I already have an account</Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Free for students</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-primary/20 blur-2xl" />
            <Card className="relative shadow-elegant border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">This week</p>
                    <p className="font-display text-2xl font-bold">5 deadlines</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { t: "CS 201 — Problem Set 4", d: "Due Tue", p: "High" },
                    { t: "ECON 110 — Essay draft", d: "Due Thu", p: "Medium" },
                    { t: "CHEM 220 — Lab report", d: "Due Fri", p: "High" },
                  ].map((r) => (
                    <div key={r.t} className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div>
                        <p className="text-sm font-medium">{r.t}</p>
                        <p className="text-xs text-muted-foreground">{r.d}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${r.p === "High" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/15 text-warning-foreground"}`}>
                        {r.p}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to stay ahead</h2>
          <p className="mt-3 text-muted-foreground">Purpose-built for the way students actually study.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: LayoutDashboard, t: "Clean dashboard", d: "See total, upcoming, completed and overdue at a glance." },
            { icon: Target, t: "Priority tracking", d: "Rank assignments Low, Medium, or High and never miss what matters." },
            { icon: Clock, t: "Study hour estimates", d: "Plan realistic sessions with per-assignment time budgets." },
            { icon: BookOpen, t: "Notes & progress", d: "Keep context, links, and notes attached to each assignment." },
            { icon: Sparkles, t: "AI study plans", d: "Generate personalized breakdowns for every deadline." },
            { icon: Zap, t: "Blazing fast", d: "Instant search, filters, and card/table views." },
          ].map((f) => (
            <Card key={f.t} className="group border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps to a stress-free semester.</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Add your assignments", d: "Import course work with due dates, priority, and study hours." },
              { n: "02", t: "Get an AI plan", d: "Smart Planner breaks big projects into daily study sessions." },
              { n: "03", t: "Track and complete", d: "Mark progress and watch your workload shrink." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border bg-card p-8 shadow-card">
                <span className="font-display text-5xl font-bold text-primary/20">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Loved by students everywhere</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: "Maya R.", r: "Biology, Year 3", q: "I finally stopped scrambling before deadlines. The AI plan is a lifesaver." },
            { n: "Daniel K.", r: "Computer Science, Year 2", q: "The dashboard is beautiful and fast. Feels made for how I actually study." },
            { n: "Priya S.", r: "Economics, Year 4", q: "Priority + hours estimate = zero panic. Cannot recommend enough." },
          ].map((t) => (
            <Card key={t.n} className="border-border/60">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed">"{t.q}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {t.n[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.n}</p>
                    <p className="text-xs text-muted-foreground">{t.r}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center shadow-elegant md:p-16">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">Your best semester starts today</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">Join thousands of students planning smarter.</p>
          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="shadow-lg">Create free account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Smart Assignment Planner AI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link to="/login" className="hover:text-foreground">Log in</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Smart Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
