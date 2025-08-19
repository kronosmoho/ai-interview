import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  role: z.string().min(1),
  domain: z.string().optional().default("")
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { role, domain } = schema.parse(json);

    // Choose model provider via env flag
    const provider = process.env.AI_PROVIDER || "openai";
    const questions = await generateQuestions({ role, domain, provider });

    return NextResponse.json({ questions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}

async function generateQuestions({ role, domain, provider }: { role: string; domain?: string; provider: string; }) {
  const system = `You are a professional interviewer. Create 8 concise, role-specific interview questions.
Role: ${role}
Domain: ${domain || "N/A"}
Focus on increasing difficulty, mix behavioral and technical.`;

  if (provider === "gemini") {
    // Lazy import to avoid bundling in edge runtimes if not needed
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const res = await model.generateContent(system);
    const text = res.response.text();
    return splitQuestions(text);
  }

  // Default: OpenAI
  const { OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const chat = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: "Return only the list of questions, each on a new line." },
    ],
    temperature: 0.7,
  });
  const text = chat.choices[0]?.message?.content || "";
  return splitQuestions(text);
}

function splitQuestions(text: string): string[] {
  return text
    .split(/\n+/)
    .map((q) => q.replace(/^\d+\.|^-\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

