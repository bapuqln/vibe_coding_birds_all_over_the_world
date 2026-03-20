import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { generateSoundGuessRound } from "../../systems/SoundGuessManager";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

export function SoundGuessPanel() {
  const language = useAppStore((s) => s.language);
  const soundGuessState = useAppStore((s) => s.soundGuessState);
  const soundGuessRound = useAppStore((s) => s.soundGuessRound);
  const soundGuessScore = useAppStore((s) => s.soundGuessScore);
  const soundGuessOptions = useAppStore((s) => s.soundGuessOptions);
  const soundGuessCorrectId = useAppStore((s) => s.soundGuessCorrectId);
  const startSoundGuess = useAppStore((s) => s.startSoundGuess);
  const setSoundGuessOptions = useAppStore((s) => s.setSoundGuessOptions);
  const answerSoundGuess = useAppStore((s) => s.answerSoundGuess);
  const nextSoundGuessRound = useAppStore((s) => s.nextSoundGuessRound);
  const endSoundGuess = useAppStore((s) => s.endSoundGuess);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const [answered, setAnswered] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRound = useCallback(() => {
    const { correctBird, options } = generateSoundGuessRound();
    setSoundGuessOptions(options, correctBird.id);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const bird = birdMap.get(correctBird.id);
    if (bird?.audioUrl) {
      const audio = new Audio(bird.audioUrl);
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  }, [setSoundGuessOptions]);

  useEffect(() => {
    if (soundGuessState === "playing") {
      setAnswered(null);
      startRound();
    }
  }, [soundGuessState, soundGuessRound, startRound]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAnswer = (birdId: string) => {
    if (answered) return;
    setAnswered(birdId);
    answerSoundGuess(birdId);

    const isCorrect = birdId === soundGuessCorrectId;
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      if (soundGuessCorrectId) setSelectedBird(soundGuessCorrectId);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setTimeout(() => {
      setAnswered(null);
      nextSoundGuessRound();
    }, 2500);
  };

  if (soundGuessState === "idle") {
    return (
      <button
        onClick={startSoundGuess}
        className="fixed left-4 bottom-16 z-10 flex h-[44px] min-w-[120px] items-center justify-center gap-2 rounded-xl bg-black/65 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95 min-[900px]:bottom-16 min-[900px]:left-4"
        aria-label={language === "zh" ? "听声辨鸟" : "Sound Guess"}
      >
        <span>🎵</span>
        <span>{language === "zh" ? "听声辨鸟" : "Sound Guess"}</span>
      </button>
    );
  }

  if (soundGuessState === "result") {
    return (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-sm rounded-[20px] bg-white/95 p-6 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-4xl">🎵</p>
          <h3 className="mt-2 text-xl font-bold text-gray-800">
            {language === "zh" ? "听声辨鸟完成！" : "Sound Guess Complete!"}
          </h3>
          <p className="mt-2 text-3xl font-bold text-amber-500">
            {soundGuessScore}/5
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => { endSoundGuess(); startSoundGuess(); }}
              className="h-[44px] rounded-xl bg-amber-500 px-5 text-sm font-semibold text-white shadow-md hover:bg-amber-600 active:scale-95"
            >
              {language === "zh" ? "再玩一次" : "Play Again"}
            </button>
            <button
              onClick={endSoundGuess}
              className="h-[44px] rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-600 hover:bg-gray-200 active:scale-95"
            >
              {language === "zh" ? "退出" : "Exit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {showConfetti && <Confetti />}
      <div
        className={`mx-4 w-full max-w-md rounded-[20px] bg-white/95 p-6 shadow-2xl backdrop-blur-xl ${shake ? "animate-[shake_0.3s_ease-in-out]" : ""}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">
            {language === "zh" ? `第 ${soundGuessRound}/5 题` : `Round ${soundGuessRound}/5`}
          </span>
          <button
            onClick={endSoundGuess}
            aria-label={language === "zh" ? "关闭" : "Close"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-center text-lg font-bold text-gray-800">
          {soundGuessState === "playing"
            ? language === "zh" ? "🎵 仔细听..." : "🎵 Listen carefully..."
            : language === "zh" ? "🤔 这是哪只鸟？" : "🤔 Which bird is this?"}
        </p>

        {soundGuessState === "guessing" && (
          <div className="grid grid-cols-3 gap-3">
            {soundGuessOptions.map((opt) => {
              const isCorrect = opt.birdId === soundGuessCorrectId;
              const isChosen = opt.birdId === answered;
              let borderClass = "border-gray-200";
              if (answered) {
                if (isCorrect) borderClass = "border-green-500 ring-2 ring-green-300";
                else if (isChosen) borderClass = "border-red-400 ring-2 ring-red-300";
              }
              return (
                <button
                  key={opt.birdId}
                  onClick={() => handleAnswer(opt.birdId)}
                  disabled={!!answered}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all hover:scale-105 ${borderClass}`}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-xl">
                    <img src={opt.photoUrl} alt={opt.nameEn} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-center text-xs font-medium text-gray-700">
                    {language === "zh" ? opt.nameZh : opt.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            backgroundColor: ["#fbbf24", "#f87171", "#34d399", "#a78bfa", "#60a5fa"][i % 5],
            animation: `confettiFall ${1.5 + Math.random()}s ease-in ${Math.random() * 0.5}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
