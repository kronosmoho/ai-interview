import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  role: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { question, answer, role } = schema.parse(json);

    const provider = process.env.AI_PROVIDER || "openai";
    const feedback = await scoreAnswer({ question, answer, role, provider });
    return NextResponse.json(feedback);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}

async function scoreAnswer({ question, answer, role, provider }: { question: string; answer: string; role?: string; provider: string; }) {
  const prompt = `You are an expert interviewer. Evaluate the candidate's answer.
Return JSON with fields: { score: 0-1, strengths: string[], improvements: string[], summary: string }.
Question: ${question}
Role: ${role || "N/A"}
Answer: ${answer}`;

  if (provider === "gemini") {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    return parseFeedback(text);
  }

  const { OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const chat = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "Respond strictly with valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });
  const text = chat.choices[0]?.message?.content || "{}";
  return parseFeedback(text);
}

function parseFeedback(text: string) {
  try {
    const data = JSON.parse(text);
    return {
      score: clamp01(Number(data.score ?? 0)),
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      summary: String(data.summary || ""),
    };
  } catch {
    return {
      score: 0.5,
      strengths: [],
      improvements: ["Could not parse model output. Provide clearer structure."],
      summary: text.slice(0, 400),
    };
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

