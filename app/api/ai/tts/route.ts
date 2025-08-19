import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const provider = process.env.AI_PROVIDER || "openai";
    if (provider === "openai") {
      const { OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const mp3 = await client.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
        format: "mp3",
      } as any);
      const arrayBuffer = await mp3.arrayBuffer();
      return new NextResponse(Buffer.from(arrayBuffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    }

    // Fallback: no TTS provider
    return NextResponse.json({ error: "TTS not configured" }, { status: 501 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "TTS failed" }, { status: 500 });
  }
}

