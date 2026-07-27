import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssignments, priorityColor } from "@/lib/assignments-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssignmentForm } from "@/components/assignment-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { format, isPast, isThisWeek } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Planner" },
      { name: "description", content: "Your assignment summary at a glance." },
      { property: "og:title", content: "Dashboard — Smart Planner" },
      { property: "og:description", content: "Your assignment summary at a glance." },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "warning" | "success" | "destructive";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          </div>
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { assignments, add } = useAssignments();
  const [open, setOpen] = useState(false);

  const total = assignments.length;
  const dueThisWeek = assignments.filter(
    (a) => a.status !== "Completed" && isThisWeek(new Date(a.dueDate), { weekStartsOn: 1 }),
  ).length;
  const completed = assignments.filter((a) => a.status === "Completed").length;
  const overdue = assignments.filter(
    (a) => a.status !== "Completed" && isPast(new Date(a.dueDate)),
  ).length;

  const upcoming = [...assignments]
    .filter((a) => a.status !== "Completed")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 5);

  const recent = [...assignments]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <AppShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your semester at a glance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 bg-gradient-primary shadow-elegant">
              <Plus className="mr-1.5 h-4 w-4" /> Add assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New assignment</DialogTitle></DialogHeader>
            <AssignmentForm
              onSubmit={(data) => {
                add(data);
                setOpen(false);
                toast.success("Assignment added");
              }}
              onCancel={() => setOpen(false)}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Assignments" value={total} tone="primary" />
        <StatCard icon={CalendarClock} label="Due This Week" value={dueThisWeek} tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} tone="success" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdue} tone="destructive" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming assignments</CardTitle>
            <Link to="/assignments" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState label="Nothing coming up — enjoy the calm ✨" />
            ) : (
              <ul className="divide-y">
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/assignments/$id"
                      params={{ id: a.id }}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40 rounded-lg px-2 -mx-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.course} · Due {format(new Date(a.dueDate), "MMM d")}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityColor(a.priority)}`}>
                        {a.priority}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New assignment
              </Button>
              <Link to="/assignments">
                <Button variant="outline" className="w-full justify-start">
                  <ListChecks className="mr-2 h-4 w-4" /> Browse all
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="mr-2 h-4 w-4" /> Open calendar
                </Button>
              </Link>
              <Button variant="outline" className="justify-start" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> AI plan (coming soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <EmptyState label="Nothing yet." />
              ) : (
                <ul className="space-y-3">
                  {recent.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          <span className="font-medium">{a.title}</span>
                          <span className="text-muted-foreground"> · {a.course}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Added {format(new Date(a.createdAt), "MMM d")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed py-10 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link to="/assignments" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        Manage assignments <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
