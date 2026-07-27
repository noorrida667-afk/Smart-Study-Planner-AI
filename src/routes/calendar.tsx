import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  useAssignments,
  priorityColor,
  statusColor,
  type Assignment,
} from "@/lib/assignments-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Smart Planner" },
      { name: "description", content: "Monthly calendar view of your assignment deadlines." },
      { property: "og:title", content: "Calendar — Smart Planner" },
      { property: "og:description", content: "See every upcoming deadline in one place." },
    ],
  }),
  component: CalendarPage,
});

function priorityDot(p: Assignment["priority"]) {
  if (p === "High") return "bg-destructive";
  if (p === "Medium") return "bg-warning";
  return "bg-primary/50";
}

function CalendarPage() {
  const { assignments, loading } = useAssignments();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Assignment | null>(null);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDay = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const key = format(new Date(a.dueDate), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [assignments]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize deadlines across the semester.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[10rem] text-center font-display text-lg font-semibold">
            {format(cursor, "MMMM yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setCursor(new Date())}>Today</Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-7 border-b pb-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border/60 pt-px">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const items = byDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[6.5rem] bg-background p-1.5 text-left sm:min-h-[7.5rem]",
                    !inMonth && "bg-muted/30 text-muted-foreground",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {items.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{items.length - 2}</span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 2).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className={cn(
                          "flex w-full items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-left text-[11px] font-medium transition-colors hover:bg-accent",
                          priorityColor(a.priority),
                        )}
                        title={`${a.title} · ${a.course}`}
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", priorityDot(a.priority))} />
                        <span className="truncate">{a.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> High</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Medium</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/50" /> Low</div>
      </div>

      {!loading && assignments.length === 0 && (
        <Card className="mt-6 border-dashed">
          <CardContent className="grid place-items-center p-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-3 font-display text-lg font-semibold">No assignments yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Add your first assignment to see deadlines here.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{selected.course}</p>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  Due {format(new Date(selected.dueDate), "EEEE, MMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityColor(selected.priority)}`}>
                  {selected.priority} priority
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColor(selected.status)}`}>
                  {selected.status}
                </span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {selected.estimatedHours}h estimated
                </span>
              </div>
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
                <Button asChild className="bg-gradient-primary shadow-elegant">
                  <Link to="/assignments/$id" params={{ id: selected.id }}>Open details</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {(() => {
        const upcoming = assignments
          .filter((a) => {
            const d = new Date(a.dueDate);
            return isSameMonth(d, cursor) || days.some((x) => isSameDay(x, d));
          })
          .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
        if (upcoming.length === 0) return null;
        return (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">This month</h2>
            <div className="mt-3 grid gap-2">
              {upcoming.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">{a.course}</p>
                    <p className="truncate font-medium">{a.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityColor(a.priority)}`}>
                      {a.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{format(new Date(a.dueDate), "MMM d")}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </AppShell>
  );
}
