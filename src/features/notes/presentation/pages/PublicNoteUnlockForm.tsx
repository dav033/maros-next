"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockPublicNoteAction } from "@/features/notes/actions/publicNoteActions";

export function PublicNoteUnlockForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await unlockPublicNoteAction(token, password);
      if (!result.ok) {
        setError(result.message ?? "That password didn’t work.");
        return;
      }
      // refresh() before push so the server component re-runs with the cookie now set;
      // without it Next can serve the cached "locked" render and bounce straight back.
      router.refresh();
      router.replace(`/p/${token}`);
    });
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border/60 p-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">This note is protected</h1>
          <p className="text-sm text-muted-foreground">
            Enter the password you were given to read it.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note-password" className="text-xs">
            Password
          </Label>
          <Input
            id="note-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="off"
            aria-invalid={error !== null}
            aria-describedby={error ? "note-password-error" : undefined}
          />
          {error && (
            <p id="note-password-error" role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending || !password}>
          {pending ? "Checking…" : "Open note"}
        </Button>
      </form>
    </div>
  );
}
