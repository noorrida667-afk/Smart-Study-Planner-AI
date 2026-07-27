import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Assignment, Priority, Status } from "@/lib/assignments-store";

export type AssignmentInput = Omit<
  Assignment,
  "id" | "userId" | "createdAt" | "studyPlan" | "studyPlanProgress"
>;

export function AssignmentForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: {
  initial?: Partial<AssignmentInput>;
  onSubmit: (data: AssignmentInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [course, setCourse] = useState(initial?.course ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [estimatedHours, setEstimatedHours] = useState<number>(initial?.estimatedHours ?? 2);
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "Medium");
  const [status, setStatus] = useState<Status>(initial?.status ?? "Pending");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          course,
          description,
          dueDate: new Date(dueDate).toISOString(),
          estimatedHours: Number(estimatedHours) || 0,
          priority,
          status,
          notes,
        });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Problem Set 4" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Input id="course" required value={course} onChange={(e) => setCourse(e.target.value)} placeholder="CS 201" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due">Due date</Label>
          <Input id="due" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours">Estimated study hours</Label>
          <Input id="hours" type="number" min={0} step={0.5} value={estimatedHours} onChange={(e) => setEstimatedHours(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this assignment about?" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" className="bg-gradient-primary shadow-elegant">{submitLabel}</Button>
      </div>
    </form>
  );
}
