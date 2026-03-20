import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

type ARState = "loading" | "active" | "unsupported" | "error";

export function ARViewerModal() {
  const arViewerBirdId = useAppStore((s) => s.arViewerBirdId);
  const setARViewerBird = useAppStore((s) => s.setARViewerBird);
  const language = useAppStore((s) => s.language);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [arState, setARState] = useState<ARState>("loading");
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const bird = arViewerBirdId ? birdMap.get(arViewerBirdId) ?? null : null;
  const isOpen = bird !== null;

  useEffect(() => {
    if (!isOpen) return;

    setARState("loading");

    if (!navigator.mediaDevices?.getUserMedia) {
      setARState("unsupported");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setARState("active");
      })
      .catch(() => {
        setARState("unsupported");
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setARViewerBird(null);
    setRotation(0);
    setScale(1);
  }, [setARViewerBird]);

  const handleRotateLeft = () => setRotation((r) => r - 30);
  const handleRotateRight = () => setRotation((r) => r + 30);
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.3));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.9)" }}
    >
      {arState === "active" && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {arState === "unsupported" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4, #14b8a6)",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.3)",
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transition: "transform 0.3s ease",
          }}
        >
          <img
            src={bird.photoUrl}
            alt={bird.nameEn}
            style={{
              width: "85%",
              height: "85%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div style={{ textAlign: "center", color: "white" }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            {language === "zh" ? bird.nameZh : bird.nameEn}
          </h3>
          <p style={{ fontSize: 13, opacity: 0.7, margin: "4px 0 0" }}>
            {bird.scientificName}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <ARControlButton onClick={handleRotateLeft} label="↺" />
          <ARControlButton onClick={handleZoomOut} label="−" />
          <ARControlButton onClick={handleZoomIn} label="+" />
          <ARControlButton onClick={handleRotateRight} label="↻" />
        </div>

        {arState === "unsupported" && (
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            {language === "zh"
              ? "您的设备不支持相机访问。正在以3D查看模式显示。"
              : "Camera not available on your device. Showing in 3D viewer mode."}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 2,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          border: "none",
          color: "white",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={language === "zh" ? "关闭" : "Close"}
      >
        ✕
      </button>
    </div>
  );
}

function ARControlButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        fontSize: 20,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}
