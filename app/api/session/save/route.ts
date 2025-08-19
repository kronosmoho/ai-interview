import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";

const schema = z.object({
  userId: z.string().min(1),
  role: z.string().default(""),
  domain: z.string().default(""),
  transcript: z.array(z.object({ question: z.string(), answer: z.string(), score: z.number().min(0).max(1) })).default([]),
  summary: z.string().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const payload = schema.parse(json);
    const doc = await adminDb.collection("sessions").add({
      ...payload,
      createdAt: Date.now(),
    });
    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save" }, { status: 400 });
  }
}

