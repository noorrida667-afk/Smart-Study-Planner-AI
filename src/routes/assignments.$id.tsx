import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssignments, priorityColor, statusColor } from "@/lib/assignments-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentForm } from "@/components/assignment-form";
import {
  ArrowLeft,
  Sparkles,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  CalendarClock,
  RefreshCw,
  Loader2,
  Lightbulb,
  BookMarked,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateStudyPlan } from "@/lib/ai.functions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/assignments/$id")({
  head: () => ({
    meta: [
      { title: "Assignment — Smart Planner" },
      { name: "description", content: "Assignment details and AI study plan." },
      { property: "og:title", content: "Assignment — Smart Planner" },
      { property: "og:description", content: "Assignment details and AI study plan." },
    ],
  }),
  component: AssignmentDetail,
});

function AssignmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { get, update, remove, toggleComplete, refresh } = useAssignments();
  const assignment = get(id);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(assignment?.notes ?? "");
  const [generating, setGenerating] = useState(false);
  const generatePlan = useServerFn(generateStudyPlan);

  useEffect(() => {
    setNotes(assignment?.notes ?? "");
  }, [assignment?.id, assignment?.notes]);

  if (!assignment) {
    return (
      <AppShell>
        <div className="grid place-items-center py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Assignment not found</h1>
          <p className="mt-2 text-muted-foreground">It may have been deleted.</p>
          <Link to="/assignments" className="mt-4">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to assignments</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const plan = assignment.studyPlan;
  const totalTasks = plan?.phases.reduce((s, p) => s + p.tasks.length, 0) ?? 0;
  const doneTasks = assignment.studyPlanProgress.length;
  const planPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const progress =
    assignment.status === "Completed"
      ? 100
      : totalTasks
        ? planPct
        : assignment.status === "In Progress"
          ? 50
          : 10;

  const runGenerate = async () => {
    setGenerating(true);
    try {
      const { studyPlan } = await generatePlan({
        data: {
          title: assignment.title,
          course: assignment.course,
          description: assignment.description ?? "",
          priority: assignment.priority,
          dueDate: assignment.dueDate,
          estimatedHours: assignment.estimatedHours,
        },
      });
      // Persist the generated plan on assignments/{assignmentId}.
      await updateDoc(doc(db, "assignments", assignment.id), {
        studyPlan,
        studyPlanProgress: [],
      });
      await refresh();
      toast.success("Study plan ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const current = assignment.studyPlanProgress;
    const next = current.includes(taskId)
      ? current.filter((x) => x !== taskId)
      : [...current, taskId];
    await update(assignment.id, { studyPlanProgress: next });
  };

  return (
    <AppShell>
      <Link to="/assignments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All assignments
      </Link>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{assignment.course}</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{assignment.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColor(assignment.priority)}`}>{assignment.priority}</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(assignment.status)}`}>{assignment.status}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => toggleComplete(assignment.id)}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> {assignment.status === "Completed" ? "Reopen" : "Complete"}
          </Button>
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-1.5 h-4 w-4" /> Edit</Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              await remove(assignment.id);
              toast.success("Deleted");
              navigate({ to: "/assignments" });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {assignment.description || "No description provided."}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoTile icon={CalendarClock} label="Due date" value={format(new Date(assignment.dueDate), "MMM d, yyyy")} sub={formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })} />
                <InfoTile icon={Clock} label="Est. hours" value={`${assignment.estimatedHours}h`} sub="Study time" />
                <InfoTile icon={CheckCircle2} label="Status" value={assignment.status} sub={`Priority ${assignment.priority}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {totalTasks ? `${doneTasks} of ${totalTasks} study tasks done` : "Overall completion"}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key points, resources, or reminders..."
                rows={5}
              />
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    await update(assignment.id, { notes });
                    toast.success("Notes saved");
                  }}
                >
                  Save notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/20">
            <div className="bg-gradient-primary p-6 text-primary-foreground">
              <Sparkles className="h-6 w-6" />
              <h3 className="mt-3 font-display text-xl font-bold">AI Study Plan</h3>
              <p className="mt-1 text-sm text-primary-foreground/85">
                {plan
                  ? "Regenerate a fresh personalized breakdown any time."
                  : "Get a personalized breakdown of daily study sessions for this assignment."}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-5 w-full shadow-lg"
                onClick={runGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Crafting your custom AI study plan...</>
                ) : plan ? (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Plan</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Study Plan</>
                )}
              </Button>
            </div>
          </Card>

          {generating && !plan && (
            <Card className="border-dashed">
              <CardContent className="grid place-items-center py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="mt-3 text-sm font-medium">Crafting your custom AI study plan...</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  This usually takes a few seconds.
                </p>
              </CardContent>
            </Card>
          )}

          {plan ? (
            <Card>
              <CardHeader><CardTitle className="text-base">AI Study Plan</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">{plan.overview}</p>

                <div className="space-y-4">
                  {plan.phases.map((phase, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">{phase.day}</p>
                      <p className="mt-1 text-sm font-semibold">{phase.focus}</p>
                      <ul className="mt-3 space-y-2">
                        {phase.tasks.map((task) => {
                          const checked = assignment.studyPlanProgress.includes(task.id);
                          return (
                            <li key={task.id} className="flex items-start gap-2">
                              <Checkbox
                                id={task.id}
                                checked={checked}
                                onCheckedChange={() => toggleTask(task.id)}
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={task.id}
                                className={`cursor-pointer text-sm ${checked ? "text-muted-foreground line-through" : ""}`}
                              >
                                {task.text}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {plan.resources?.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <BookMarked className="h-4 w-4 text-primary" /> Recommended resources
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {plan.resources.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {plan.tip && (
                  <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Productivity tip</p>
                      <p className="mt-1 text-sm">{plan.tip}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            !generating && (
              <Card className="border-dashed">
                <CardHeader><CardTitle className="text-base">AI Study Plan</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid place-items-center rounded-lg border border-dashed py-10 text-center">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">No plan generated yet</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Click "Generate AI Study Plan" to build a personalized, phase-by-phase schedule.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit assignment</DialogTitle></DialogHeader>
          <AssignmentForm
            initial={assignment}
            onSubmit={async (data) => {
              await update(assignment.id, data);
              setEditing(false);
              toast.success("Updated");
            }}
            onCancel={() => setEditing(false)}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
