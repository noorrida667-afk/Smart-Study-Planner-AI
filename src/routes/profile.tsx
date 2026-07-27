import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword, updateProfile, updateEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { firebaseErrorMessage } from "@/lib/auth-context";
import { useAssignments } from "@/lib/assignments-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Smart Planner" },
      { name: "description", content: "Manage your Smart Planner profile." },
      { property: "og:title", content: "Profile — Smart Planner" },
      { property: "og:description", content: "Manage your profile settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { assignments } = useAssignments();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    setName(user.displayName ?? "");
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const data = snap.data();
      if (data) {
        if (data.fullName) setName(data.fullName as string);
        if (data.email) setEmail(data.email as string);
      }
    });
  }, [user]);

  const total = assignments.length;
  const done = assignments.filter((a) => a.status === "Completed").length;
  const active = total - done;

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || (email[0]?.toUpperCase() ?? "U");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, fullName: name, email }, { merge: true });
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name });
      if (auth.currentUser && email && email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }
      toast.success("Profile updated");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      toast.error(code ? firebaseErrorMessage(code) : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords don't match");
      return;
    }
    setPassSaving(true);
    try {
      if (!auth.currentUser) throw new Error("Not signed in");
      await updatePassword(auth.currentUser, newPass);
      toast.success("Password updated");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      toast.error(code ? firebaseErrorMessage(code) : "Could not update password");
    } finally {
      setPassSaving(false);
    }
  };


  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account information.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-primary text-2xl font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-xl font-bold">{name || "Student"}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
              <Stat n={String(total)} l="Total" />
              <Stat n={String(done)} l="Done" />
              <Stat n={String(active)} l="Active" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" className="bg-gradient-primary shadow-elegant" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={changePassword}>
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button variant="outline" type="submit" disabled={passSaving}>
                    {passSaving ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="font-display text-xl font-bold">{n}</p>
      <p className="text-xs text-muted-foreground">{l}</p>
    </div>
  );
}
