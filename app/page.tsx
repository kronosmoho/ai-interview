"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [role, setRole] = useState<string>("");
  const [domain, setDomain] = useState<string>("");

  return (
    <main className="container py-10">
      <section className="card">
        <div className="card-header">
          <h1 className="text-2xl font-semibold">AI Interviewer</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            Simulate realistic interviews and get AI-driven feedback.
          </p>
        </div>
        <div className="card-content space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Role</label>
              <input
                className="input mt-2"
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Domain</label>
              <input
                className="input mt-2"
                placeholder="e.g. React, Next.js"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/interview?role=${encodeURIComponent(role)}&domain=${encodeURIComponent(domain)}`}
              className="btn btn-primary"
            >
              Start Interview
            </Link>
            <Link href="/auth" className="btn btn-outline">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

