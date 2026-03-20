import { useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const IDLE_TIPS = [
  { en: "Did you know? Penguins cannot fly but are excellent swimmers!", zh: "你知道吗？企鹅不会飞，但它们是出色的游泳健将！" },
  { en: "Try clicking on a bird to learn more about it!", zh: "试试点击一只鸟来了解更多！" },
  { en: "Birds live on every continent — even Antarctica!", zh: "鸟类生活在每个大洲——甚至南极洲！" },
  { en: "Some birds can fly thousands of kilometers without stopping!", zh: "有些鸟可以不停歇地飞行数千公里！" },
  { en: "The Bald Eagle can see fish from 2 km away!", zh: "白头海雕能从2公里外看到鱼！" },
];

export function BirdGuide() {
  const language = useAppStore((s) => s.language);
  const guideMessage = useAppStore((s) => s.guideMessage);
  const guideMessageZh = useAppStore((s) => s.guideMessageZh);
  const setGuideMessage = useAppStore((s) => s.setGuideMessage);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const activeRegion = useAppStore((s) => s.activeRegion);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selectedBirdId) {
      const bird = birdMap.get(selectedBirdId);
      if (bird) {
        const en = `${bird.nameEn} — ${bird.funFactEn.slice(0, 80)}...`;
        const zh = `${bird.nameZh} — ${bird.funFactZh.slice(0, 40)}...`;
        setGuideMessage(en, zh);
      }
    }
  }, [selectedBirdId, setGuideMessage]);

  useEffect(() => {
    if (activeRegion) {
      const regionNames: Record<string, { en: string; zh: string }> = {
        asia: { en: "Asia", zh: "亚洲" },
        europe: { en: "Europe", zh: "欧洲" },
        africa: { en: "Africa", zh: "非洲" },
        "north-america": { en: "North America", zh: "北美洲" },
        "south-america": { en: "South America", zh: "南美洲" },
        oceania: { en: "Oceania", zh: "大洋洲" },
        antarctica: { en: "Antarctica", zh: "南极洲" },
      };
      const r = regionNames[activeRegion];
      if (r) {
        setGuideMessage(
          `Welcome to ${r.en}! Let's discover the birds here.`,
          `欢迎来到${r.zh}！让我们发现这里的鸟类。`,
        );
      }
    }
  }, [activeRegion, setGuideMessage]);

  useEffect(() => {
    if (guideMessage) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setGuideMessage(null, null);
      }, 5000);
      return () => clearTimeout(timerRef.current);
    }
  }, [guideMessage, setGuideMessage]);

  useEffect(() => {
    const showIdleTip = () => {
      if (!selectedBirdId && !guideMessage) {
        const tip = IDLE_TIPS[Math.floor(Math.random() * IDLE_TIPS.length)];
        setGuideMessage(tip.en, tip.zh);
      }
    };

    idleTimerRef.current = setTimeout(showIdleTip, 15000);
    return () => clearTimeout(idleTimerRef.current);
  }, [selectedBirdId, guideMessage, setGuideMessage]);

  const message = language === "zh" ? guideMessageZh : guideMessage;
  if (!message) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-4 z-10 max-w-xs animate-[slideInLeft_0.4s_ease-out] min-[900px]:bottom-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-start gap-3 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
          🦉
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-700">
            {language === "zh" ? "小鸟向导" : "Bird Guide"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{message}</p>
        </div>
      </div>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
