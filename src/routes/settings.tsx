import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, type DefaultSort, type DefaultView, type Theme } from "@/lib/settings-store";
import { useAssignments } from "@/lib/assignments-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Download, KeyRound, Moon, Sun } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Planner" },
      { name: "description", content: "Manage notifications, preferences, and your account." },
      { property: "og:title", content: "Settings — Smart Planner" },
      { property: "og:description", content: "Personalize your Smart Planner experience." },
    ],
  }),
  component: SettingsPage,
});

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function SettingsPage() {
  const { settings, update } = useSettings();
  const { assignments } = useAssignments();
  const { user, resetPassword } = useAuth();
  const [resetting, setResetting] = useState(false);

  const handleExport = (fmt: "json" | "csv") => {
    if (assignments.length === 0) {
      toast.info("No assignments to export yet.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    if (fmt === "json") {
      download(`assignments-${stamp}.json`, JSON.stringify(assignments, null, 2), "application/json");
    } else {
      const rows = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        course: a.course,
        description: a.description,
        due_date: a.dueDate,
        estimated_hours: a.estimatedHours,
        priority: a.priority,
        status: a.status,
        notes: a.notes ?? "",
        created_at: a.createdAt,
      }));
      download(`assignments-${stamp}.csv`, toCsv(rows), "text/csv");
    }
    toast.success(`Exported ${assignments.length} assignments`);
  };

  const handleReset = async () => {
    if (!user?.email) {
      toast.error("No email on file for this account.");
      return;
    }
    setResetting(true);
    const { error } = await resetPassword(user.email);
    setResetting(false);
    if (error) toast.error(error);
    else toast.success("Password reset email sent — check your inbox.");
  };

  return (
    <AppShell>
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize your Smart Planner experience.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control what reminders you receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor="emailReminders" className="text-sm font-medium">
                  Email reminders for upcoming deadlines
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get an email 24 hours before an assignment is due.
                </p>
              </div>
              <Switch
                id="emailReminders"
                checked={settings.emailReminders}
                onCheckedChange={(v) => update({ emailReminders: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor="studyPlan" className="text-sm font-medium">
                  Daily study plan notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reminders for today's steps from your AI study plans.
                </p>
              </div>
              <Switch
                id="studyPlan"
                checked={settings.studyPlanNotifications}
                onCheckedChange={(v) => update({ studyPlanNotifications: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Defaults applied across the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Default assignments view</Label>
                <Select
                  value={settings.defaultView}
                  onValueChange={(v) => update({ defaultView: v as DefaultView })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Card view</SelectItem>
                    <SelectItem value="table">Table view</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Default sorting</Label>
                <Select
                  value={settings.defaultSort}
                  onValueChange={(v) => update({ defaultSort: v as DefaultSort })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due-asc">Due date ↑ (soonest first)</SelectItem>
                    <SelectItem value="due-desc">Due date ↓ (latest first)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
              </div>
              <div className="inline-flex rounded-lg border p-1">
                <button
                  onClick={() => update({ theme: "light" as Theme })}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                    settings.theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  onClick={() => update({ theme: "dark" as Theme })}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                    settings.theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Account</CardTitle>
            <CardDescription>Export your data or manage your credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Export assignments</Label>
              <p className="text-xs text-muted-foreground">
                Download all your assignments ({assignments.length}) as JSON or CSV.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => handleExport("json")}>
                  <Download className="mr-1.5 h-4 w-4" /> Export JSON
                </Button>
                <Button variant="outline" onClick={() => handleExport("csv")}>
                  <Download className="mr-1.5 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <p className="text-xs text-muted-foreground">
                We'll email a secure link to {user?.email ?? "your inbox"} to reset your password.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleReset}
                disabled={resetting || !user?.email}
              >
                <KeyRound className="mr-1.5 h-4 w-4" />
                {resetting ? "Sending…" : "Send password reset email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
