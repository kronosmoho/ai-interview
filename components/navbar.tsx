"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  return (
    <header className="border-b border-[hsl(var(--border))]">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">AI Interviewer</Link>
        <nav className="flex items-center gap-3">
          <Link href="/interview" className="text-sm text-[hsl(var(--muted-foreground))] hover:underline">Interview</Link>
          {email ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:inline">{email}</span>
              <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
            </div>
          ) : (
            <Button asChild size="sm"><Link href="/auth">Sign in</Link></Button>
          )}
        </nav>
      </div>
    </header>
  );
}

