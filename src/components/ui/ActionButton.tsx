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
        gap: 8,
        height: 44,
        minWidth: 120,
        width: 120,
        padding: "0 16px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        transition: "transform 0.2s, background 0.2s",
        background: active ? "#f59e0b" : "rgba(0,0,0,0.65)",
        color: "white",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
    >
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <span>{children}</span>
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
          padding: "0 4px",
          borderRadius: 9999,
          background: "#f59e0b",
          fontSize: 10,
          fontWeight: 700,
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
