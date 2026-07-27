import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssignmentForm } from "@/components/assignment-form";
import {
  useAssignments,
  priorityColor,
  statusColor,
  type Assignment,
  type Priority,
  type Status,
} from "@/lib/assignments-store";
import { useSettings } from "@/lib/settings-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  BookOpen,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

export const Route = createFileRoute("/assignments/")({
  head: () => ({
    meta: [
      { title: "Assignments — Smart Planner" },
      { name: "description", content: "View, filter, and manage all your assignments." },
      { property: "og:title", content: "Assignments — Smart Planner" },
      { property: "og:description", content: "All your coursework in one place." },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { assignments, add, update, remove, toggleComplete } = useAssignments();
  const { settings } = useSettings();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [sort, setSort] = useState<"due-asc" | "due-desc">(settings.defaultSort);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const filtered = useMemo(() => {
    let list = assignments.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (priority !== "all" && a.priority !== priority) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!a.title.toLowerCase().includes(s) && !a.course.toLowerCase().includes(s)) return false;
      }
      return true;
    });
    list = list.sort((a, b) =>
      sort === "due-asc"
        ? +new Date(a.dueDate) - +new Date(b.dueDate)
        : +new Date(b.dueDate) - +new Date(a.dueDate),
    );
    return list;
  }, [assignments, q, status, priority, sort]);

  return (
    <AppShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">{assignments.length} total · {filtered.length} shown</p>
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

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title or course..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="grid grid-cols-3 gap-2 md:flex md:w-auto">
            <Select value={status} onValueChange={(v) => setStatus(v as Status | "all")}>
              <SelectTrigger className="min-w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "all")}>
              <SelectTrigger className="min-w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="min-w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="due-asc">Due date ↑</SelectItem>
                <SelectItem value="due-desc">Due date ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={settings.defaultView} className="mt-6">
        <TabsList>
          <TabsTrigger value="cards">Card view</TabsTrigger>
          <TabsTrigger value="table">Table view</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          {filtered.length === 0 ? (
            <EmptyBlock onAdd={() => setOpen(true)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <Card key={a.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">{a.course}</p>
                        <Link to="/assignments/$id" params={{ id: a.id }} className="mt-1 block">
                          <h3 className="truncate font-semibold group-hover:text-primary">{a.title}</h3>
                        </Link>
                      </div>
                      <RowMenu
                        onEdit={() => setEditing(a)}
                        onDelete={() => {
                          remove(a.id);
                          toast.success("Deleted");
                        }}
                        onToggle={() => toggleComplete(a.id)}
                        completed={a.status === "Completed"}
                      />
                    </div>
                    {a.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityColor(a.priority)}`}>{a.priority}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(a.status)}`}>{a.status}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {a.estimatedHours}h
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                      <span className={isPast(new Date(a.dueDate)) && a.status !== "Completed" ? "text-destructive font-medium" : "text-muted-foreground"}>
                        Due {format(new Date(a.dueDate), "MMM d, yyyy")}
                      </span>
                      <span className="text-muted-foreground">{formatDistanceToNow(new Date(a.dueDate), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <EmptyBlock onAdd={() => setOpen(true)} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a) => (
                        <TableRow key={a.id} className="cursor-pointer">
                          <TableCell className="font-medium">
                            <Link to="/assignments/$id" params={{ id: a.id }} className="hover:text-primary">
                              {a.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{a.course}</TableCell>
                          <TableCell className={isPast(new Date(a.dueDate)) && a.status !== "Completed" ? "text-destructive" : ""}>
                            {format(new Date(a.dueDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{a.estimatedHours}h</TableCell>
                          <TableCell>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityColor(a.priority)}`}>{a.priority}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(a.status)}`}>{a.status}</span>
                          </TableCell>
                          <TableCell>
                            <RowMenu
                              onEdit={() => setEditing(a)}
                              onDelete={() => {
                                remove(a.id);
                                toast.success("Deleted");
                              }}
                              onToggle={() => toggleComplete(a.id)}
                              completed={a.status === "Completed"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit assignment</DialogTitle></DialogHeader>
          {editing && (
            <AssignmentForm
              initial={editing}
              onSubmit={(data) => {
                update(editing.id, data);
                setEditing(null);
                toast.success("Updated");
              }}
              onCancel={() => setEditing(null)}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function RowMenu({
  onEdit,
  onDelete,
  onToggle,
  completed,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  completed: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onToggle}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> {completed ? "Mark as pending" : "Mark completed"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyBlock({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">No assignments found</h3>
      <p className="mt-1 text-sm text-muted-foreground">Adjust filters or add your first assignment.</p>
      <Button onClick={onAdd} className="mt-4 bg-gradient-primary shadow-elegant">
        <Plus className="mr-1.5 h-4 w-4" /> Add assignment
      </Button>
    </div>
  );
}
