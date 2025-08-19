"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AIVoice({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  const speak = async () => {
    try {
      setSpeaking(true);
      const res = await fetch("/api/ai/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      await audio.play();
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={speak} disabled={!text || speaking}>
      {speaking ? "Speaking..." : "Play"}
    </Button>
  );
}

