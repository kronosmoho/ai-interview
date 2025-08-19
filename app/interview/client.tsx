"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Recorder } from "./components/recorder";
import { AIVoice } from "./components/ai-voice";

type Feedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

export default function ClientInterview() {
  const params = useSearchParams();
  const role = params.get("role") || "";
  const domain = params.get("domain") || "";

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, domain }),
        });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [role, domain]);

  const currentQuestion = useMemo(() => questions[currentIndex] || "", [questions, currentIndex]);

  const onScore = async () => {
    if (!currentQuestion || !userAnswer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/score-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, answer: userAnswer, role }),
      });
      const data = (await res.json()) as Feedback;
      setFeedback(data);
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => {
    setFeedback(null);
    setUserAnswer("");
    setCurrentIndex((i) => Math.min(i + 1, Math.max(0, questions.length - 1)));
  };

  return (
    <main className="container py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Question {currentIndex + 1}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{currentQuestion || (loading ? "Loading..." : "No questions yet")}</p>
          </div>
          <div className="card-content space-y-4">
            <Textarea
              placeholder="Type your answer here or use the mic"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={8}
            />
            <div className="flex items-center gap-3">
              <Recorder onTranscribed={(t) => setUserAnswer((prev) => (prev ? prev + "\n" : "") + t)} />
              <Button onClick={onScore} disabled={!userAnswer || loading}>
                {loading ? "Scoring..." : "Get Feedback"}
              </Button>
              <Button onClick={onNext} variant="ghost" disabled={currentIndex >= questions.length - 1}>
                Next Question
              </Button>
              <AIVoice text={currentQuestion} />
            </div>
          </div>
        </section>

        <aside className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Feedback</h3>
          </div>
          <div className="card-content space-y-3">
            {feedback ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">Score</div>
                  <div className="progress mt-2">
                    <div className="progress-bar" style={{ width: `${Math.round((feedback.score || 0) * 100)}%` }} />
                  </div>
                  <div className="text-xs mt-1">{Math.round((feedback.score || 0) * 100)}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Strengths</div>
                  <ul className="list-disc pl-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {feedback.strengths?.length ? feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    )) : <li>Pending</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium">Improvements</div>
                  <ul className="list-disc pl-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {feedback.improvements?.length ? feedback.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    )) : <li>Pending</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium">Summary</div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{feedback.summary || ""}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Submit an answer to see feedback.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

