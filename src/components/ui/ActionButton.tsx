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
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 44,
        width: 120,
        padding: "0 12px",
        borderRadius: 14,
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: active
          ? "0 4px 16px rgba(245, 158, 11, 0.3)"
          : "0 4px 12px rgba(0,0,0,0.2)",
        transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
        background: active ? "#f59e0b" : "rgba(0,0,0,0.6)",
        color: "white",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
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
          boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
