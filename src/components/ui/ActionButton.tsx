import type { ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  badge?: string | number;
  ariaLabel?: string;
  icon?: string;
}

export function ActionButton({
  children,
  onClick,
  active = false,
  badge,
  ariaLabel,
  icon,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="glass-button"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 44,
        width: 120,
        padding: "0 16px",
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        border: active ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(255, 255, 255, 0.18)",
        cursor: "pointer",
        background: active
          ? "rgba(245, 158, 11, 0.85)"
          : "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: "white",
        flexShrink: 0,
        boxShadow: active
          ? "0 4px 20px rgba(245, 158, 11, 0.35), 0 0 12px rgba(245, 158, 11, 0.2)"
          : "0 4px 16px rgba(0, 0, 0, 0.15)",
        animation: active ? "glowPulse 2s ease-in-out infinite" : "none",
      }}
    >
      {icon && <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>}
      <span style={{ whiteSpace: "nowrap" }}>{children}</span>
      {badge !== undefined && (
        <span style={{
          position: "absolute",
          right: -6,
          top: -6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 20,
          minWidth: 20,
          padding: "0 5px",
          borderRadius: 9999,
          background: "#ef4444",
          fontSize: 10,
          fontWeight: 700,
          color: "white",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
