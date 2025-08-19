import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Need Node for formdata and buffers

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }
    const provider = process.env.AI_PROVIDER || "openai";
    const text = await transcribeAudio(file, provider);
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Transcription failed" }, { status: 500 });
  }
}

async function transcribeAudio(file: Blob, provider: string) {
  if (provider === "gemini") {
    // Gemini does not have a direct Whisper analog; fallback to OpenAI if key present
  }
  const { OpenAI } = await import("openai");
  const { toFile } = await import("openai/uploads");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const response = await client.audio.transcriptions.create({
    file: await toFile(buffer, "input.webm", { type: file.type || "application/octet-stream" }),
    model: process.env.OPENAI_STT_MODEL || "gpt-4o-transcribe",
    // fallback models could be: "whisper-1"
  } as any);
  // SDK type issues between versions; cast to any above
  const text: string = (response as any).text || "";
  return text;
}
