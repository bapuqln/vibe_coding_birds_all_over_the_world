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
      className={`
        relative flex h-11 min-w-30 items-center justify-center gap-2
        rounded-xl px-4 text-sm font-semibold
        shadow-lg backdrop-blur-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${
          active
            ? "bg-amber-500 text-white ring-2 ring-amber-300/50"
            : "bg-black/65 text-white hover:bg-black/75"
        }
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow">
          {badge}
        </span>
      )}
    </button>
  );
}
