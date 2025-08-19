export type InterviewQuestion = {
  id: string;
  text: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
};

export type InterviewAnswer = {
  questionId: string;
  answerText: string;
  score?: number; // 0..1
  feedback?: {
    strengths: string[];
    improvements: string[];
    summary: string;
  };
};

