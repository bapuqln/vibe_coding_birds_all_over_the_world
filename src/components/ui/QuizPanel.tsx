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
          } catch { /* fall through */ }
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
        className="fixed flex h-[44px] min-w-[120px] items-center justify-center gap-2 rounded-xl bg-black/65 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
        style={{ left: "var(--safe-area)", bottom: "var(--safe-area)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <span>🎮</span>
        <span>{language === "zh" ? "答题" : "Quiz"}</span>
      </button>
    );
  }

  if (quizState === "result") {
    return (
      <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/50 p-5" style={{ zIndex: "var(--z-modal)", animation: "panelScaleFade var(--panel-duration) var(--panel-ease)" }}>
        <div className="flex max-w-sm flex-col items-center gap-6 rounded-[20px] bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-2xl font-bold text-amber-800">
            {language === "zh" ? "太棒了！" : "Great job!"}
          </p>
          <p className="text-xl text-amber-700">
            {language === "zh" ? "得分" : "Score"}: {quizScore}/3
          </p>
          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="h-[44px] min-w-[100px] rounded-xl bg-amber-500 px-6 font-bold text-white transition-all hover:bg-amber-600 active:scale-95"
            >
              {language === "zh" ? "再玩一次" : "Play Again"}
            </button>
            <button
              onClick={handleClose}
              className="h-[44px] min-w-[80px] rounded-xl bg-gray-100 px-6 font-bold text-gray-600 transition-all hover:bg-gray-200 active:scale-95"
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
    <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/50 p-5" style={{ zIndex: "var(--z-modal)", animation: "panelScaleFade var(--panel-duration) var(--panel-ease)" }}>
      <div
        className={`flex max-w-md flex-col gap-6 rounded-[20px] bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all ${
          feedback === "correct" ? "animate-quiz-correct" : ""
        } ${feedback === "wrong" ? "animate-quiz-shake" : ""}`}
      >
        {feedback === "correct" && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
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
              ? language === "zh" ? bird.nameZh : bird.nameEn
              : birdId;
            return (
              <button
                key={birdId}
                onClick={() => handleAnswer(birdId)}
                disabled={answered}
                className="h-12 w-full rounded-xl bg-amber-50 px-4 text-left font-medium text-amber-900 transition-all hover:bg-amber-100 active:scale-[0.98] disabled:opacity-70"
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
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
