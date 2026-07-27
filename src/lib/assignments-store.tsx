import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

export type Priority = "Low" | "Medium" | "High";
export type Status = "Pending" | "In Progress" | "Completed";

export interface StudyPlanTask {
  id: string;
  text: string;
}
export interface StudyPlanPhase {
  day: string;
  focus: string;
  tasks: StudyPlanTask[];
}
export interface StudyPlan {
  overview: string;
  phases: StudyPlanPhase[];
  resources: string[];
  tip: string;
}

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  estimatedHours: number;
  priority: Priority;
  status: Status;
  notes?: string;
  createdAt: string;
  studyPlan?: StudyPlan | null;
  studyPlanProgress: string[];
}

interface Ctx {
  assignments: Assignment[];
  loading: boolean;
  add: (
    a: Omit<Assignment, "id" | "userId" | "createdAt" | "studyPlanProgress" | "studyPlan">,
  ) => Promise<Assignment | null>;
  update: (id: string, patch: Partial<Omit<Assignment, "id" | "userId" | "createdAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  get: (id: string) => Assignment | undefined;
  refresh: () => Promise<void>;
}

const AssignmentsContext = createContext<Ctx | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIso(v: any): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v?.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return new Date().toISOString();
}

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Assignment {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.userId ?? "",
    title: d.title ?? "",
    course: d.course ?? "",
    description: d.description ?? "",
    dueDate: toIso(d.dueDate),
    estimatedHours: Number(d.estimatedHours ?? 0),
    priority: (d.priority ?? "Medium") as Priority,
    status: (d.status ?? "Pending") as Status,
    notes: d.notes ?? "",
    createdAt: toIso(d.createdAt),
    studyPlan: (d.studyPlan ?? null) as StudyPlan | null,
    studyPlanProgress: (d.studyPlanProgress ?? []) as string[],
  };
}

const sortByDueDate = (a: Assignment, b: Assignment) => a.dueDate.localeCompare(b.dueDate);

export function AssignmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Live query scoped to the signed-in user.
  useEffect(() => {
    if (!user) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "assignments"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAssignments(snap.docs.map(fromDoc).sort(sortByDueDate));
        setLoading(false);
      },
      (err) => {
        toast.error(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const refresh = useCallback(async () => {
    // Firestore keeps the list live via onSnapshot; nothing to re-fetch.
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      assignments,
      loading,
      refresh,
      add: async (a) => {
        if (!user) return null;
        try {
          const payload = {
            userId: user.uid,
            title: a.title,
            course: a.course,
            description: a.description ?? "",
            dueDate: a.dueDate,
            estimatedHours: Number(a.estimatedHours ?? 0),
            priority: a.priority,
            status: a.status,
            notes: a.notes ?? "",
            studyPlan: null,
            studyPlanProgress: [] as string[],
            createdAt: serverTimestamp(),
          };
          const ref = await addDoc(collection(db, "assignments"), payload);
          return {
            ...payload,
            id: ref.id,
            createdAt: new Date().toISOString(),
            studyPlan: null,
          } as Assignment;
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not create assignment");
          return null;
        }
      },
      update: async (id, patch) => {
        try {
          const clean: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(patch)) {
            if (v !== undefined) clean[k] = v;
          }
          await updateDoc(doc(db, "assignments", id), clean);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not update assignment");
        }
      },
      remove: async (id) => {
        try {
          await deleteDoc(doc(db, "assignments", id));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not delete assignment");
        }
      },
      toggleComplete: async (id) => {
        const current = assignments.find((x) => x.id === id);
        if (!current) return;
        const nextStatus: Status = current.status === "Completed" ? "Pending" : "Completed";
        try {
          await updateDoc(doc(db, "assignments", id), { status: nextStatus });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not update assignment");
        }
      },
      get: (id) => assignments.find((x) => x.id === id),
    }),
    [assignments, loading, refresh, user],
  );

  return <AssignmentsContext.Provider value={value}>{children}</AssignmentsContext.Provider>;
}

export function useAssignments() {
  const ctx = useContext(AssignmentsContext);
  if (!ctx) throw new Error("useAssignments must be used within AssignmentsProvider");
  return ctx;
}

export function priorityColor(p: Priority) {
  return p === "High"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : p === "Medium"
      ? "bg-warning/15 text-warning-foreground border-warning/30"
      : "bg-muted text-muted-foreground border-border";
}

export function statusColor(s: Status) {
  return s === "Completed"
    ? "bg-success/15 text-success border-success/30"
    : s === "In Progress"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border";
}
