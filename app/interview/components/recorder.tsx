"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function Recorder({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    };
  }, []);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("file", blob, "recording.webm");
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (data.text) onTranscribed(data.text);
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stop = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button variant="outline" onClick={start}>Start Mic</Button>
      ) : (
        <Button onClick={stop}>Stop & Transcribe</Button>
      )}
    </div>
  );
}

