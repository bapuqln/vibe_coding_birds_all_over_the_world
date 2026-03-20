import { useState, useCallback, useEffect, useMemo } from "react";
import { useAppStore } from "../../store";
import { generateQuizRound } from "../../systems/QuizManager";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { useAudio } from "../../hooks/useAudio";
import { fetchBirdAudio } from "../../utils/xeno-canto";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const CONFETTI_DOTS = [
  { left: "20%", delay: 0, color: "#fbbf24" },
  { left: "35%", delay: 0.05, color: "#22c55e" },
  { left: "50%", delay: 0.1, color: "#f59e0b" },
  { left: "65%", delay: 0.15, color: "#10b981" },
  { left: "80%", delay: 0.2, color: "#eab308" },
];

export function QuizPanel() {
  const language = useAppStore((s) => s.language);
  const quizState = useAppStore((s) => s.quizState);
  const quizQuestions = useAppStore((s) => s.quizQuestions);
  const quizCurrentIndex = useAppStore((s) => s.quizCurrentIndex);
  const quizScore = useAppStore((s) => s.quizScore);
  const startQuiz = useAppStore((s) => s.startQuiz);
  const answerQuiz = useAppStore((s) => s.answerQuiz);
  const nextQuizQuestion = useAppStore((s) => s.nextQuizQuestion);
  const endQuiz = useAppStore((s) => s.endQuiz);

  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answered, setAnswered] = useState(false);
  const { play, stop } = useAudio();

  const currentQuestion = useMemo(
    () => quizQuestions[quizCurrentIndex] ?? null,
    [quizQuestions, quizCurrentIndex],
  );

  const handleStartQuiz = useCallback(() => {
    const questions = generateQuizRound();
    startQuiz(questions);
  }, [startQuiz]);

  const handleAnswer = useCallback(
    (birdId: string) => {
      if (answered) return;
      const correct = birdId === currentQuestion?.correctBirdId;
      setAnswered(true);
      setFeedback(correct ? "correct" : "wrong");
      answerQuiz(correct);

      setTimeout(() => {
        nextQuizQuestion();
        setFeedback(null);
        setAnswered(false);
      }, 1500);
    },
    [answered, currentQuestion?.correctBirdId, answerQuiz, nextQuizQuestion],
  );

  const handlePlayAgain = useCallback(() => {
    handleStartQuiz();
  }, [handleStartQuiz]);

  const handleClose = useCallback(() => {
    stop();
    endQuiz();
  }, [stop, endQuiz]);

  useEffect(() => {
    if (quizState !== "active" || !currentQuestion) return;
    stop();

    if (currentQuestion.type === "sound") {
      const bird = birdMap.get(currentQuestion.correctBirdId);
      if (!bird) return;

      const controller = new AbortController();
      const tryPlay = async () => {
        if (bird.audioUrl) {
          try {
            await play(bird.audioUrl);
            return;
          } catch {
            /* fall through */
          }
        }
        const url = await fetchBirdAudio(bird.xenoCantoQuery, controller.signal);
        if (url) await play(url);
      };
      tryPlay().catch(() => {});
      return () => controller.abort();
    }
  }, [quizState, quizCurrentIndex, currentQuestion?.type, currentQuestion?.correctBirdId, play, stop]);

  if (quizState === "idle") {
    return (
      <button
        onClick={handleStartQuiz}
        aria-label={language === "zh" ? "开始答题" : "Start Quiz"}
        className="pointer-events-auto fixed bottom-20 right-4 z-40 flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-base font-bold text-amber-950 shadow-lg transition-all hover:scale-105 hover:bg-amber-400 active:scale-95 md:bottom-6 md:right-6"
      >
        <span>🎮</span>
        <span>{language === "zh" ? "答题" : "Quiz"}</span>
      </button>
    );
  }

  if (quizState === "result") {
    return (
      <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-w-sm flex-col items-center gap-6 rounded-2xl bg-amber-50 p-8 shadow-xl">
          <p className="text-2xl font-bold text-amber-800">
            {language === "zh" ? "太棒了！" : "Great job!"}
          </p>
          <p className="text-xl text-amber-700">
            {language === "zh" ? "得分" : "Score"}: {quizScore}/3
          </p>
          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="min-h-12 min-w-30 rounded-xl bg-amber-500 px-6 py-3 font-bold text-amber-950 transition-all hover:bg-amber-400 active:scale-95"
            >
              {language === "zh" ? "再玩一次" : "Play Again"}
            </button>
            <button
              onClick={handleClose}
              className="min-h-12 min-w-25 rounded-xl bg-amber-200 px-6 py-3 font-bold text-amber-900 transition-all hover:bg-amber-300 active:scale-95"
            >
              {language === "zh" ? "关闭" : "Close"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "active" && !currentQuestion) return null;

  const prompt =
    language === "zh" ? currentQuestion!.promptZh : currentQuestion!.prompt;
  const options = currentQuestion!.options ?? [];

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`flex max-w-md flex-col gap-6 rounded-2xl bg-amber-50 p-6 shadow-xl transition-all ${
          feedback === "correct" ? "animate-quiz-correct" : ""
        } ${feedback === "wrong" ? "animate-quiz-shake" : ""}`}
      >
        {feedback === "correct" && (
          <div
            className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            aria-hidden="true"
          >
            {CONFETTI_DOTS.map((dot, i) => (
              <div
                key={i}
                className="absolute top-1/4 h-2 w-2 rounded-full"
                style={{
                  left: dot.left,
                  backgroundColor: dot.color,
                  animation: `confetti-fall 1.5s ease-out ${dot.delay}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700">
            {quizCurrentIndex + 1}/3
          </span>
          <span className="text-sm font-bold text-amber-800">
            {language === "zh" ? "得分" : "Score"}: {quizScore}
          </span>
        </div>

        <p className="text-lg font-semibold text-amber-900">{prompt}</p>

        <div className="flex flex-col gap-3">
          {options.map((birdId) => {
            const bird = birdMap.get(birdId);
            const name = bird
              ? language === "zh"
                ? bird.nameZh
                : bird.nameEn
              : birdId;
            return (
              <button
                key={birdId}
                onClick={() => handleAnswer(birdId)}
                disabled={answered}
                className="min-h-12 w-full rounded-xl bg-amber-100 px-4 py-3 text-left font-medium text-amber-900 transition-all hover:bg-amber-200 active:scale-[0.98] disabled:opacity-70"
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes quiz-correct {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .animate-quiz-correct {
          animation: quiz-correct 0.6s ease-out;
          background: linear-gradient(to bottom, rgba(34, 197, 94, 0.15), transparent);
        }
        @keyframes quiz-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-quiz-shake {
          animation: quiz-shake 0.5s ease-in-out;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
