"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [user, setUser] = useState<null | { uid: string; email: string | null }>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ uid: u.uid, email: u.email });
      else setUser(null);
    });
    return () => unsub();
  }, []);

  const handleGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  };

  return (
    <main className="container py-10">
      <section className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold">Sign In</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            Use your account to save sessions and track progress.
          </p>
        </div>
        <div className="card-content space-y-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="text-sm">Signed in as {user.email || user.uid}</div>
              <Button onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
            <Button onClick={handleGoogle}>Continue with Google</Button>
          )}
        </div>
      </section>
    </main>
  );
}

