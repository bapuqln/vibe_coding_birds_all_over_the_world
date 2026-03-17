import type { ReactNode } from "react";
import { useAppStore } from "../../store";
import type { AppMode } from "../../types";

export function ModeGate({
  modes,
  children,
}: {
  modes: AppMode[];
  children: ReactNode;
}) {
  const appMode = useAppStore((s) => s.appMode);
  if (!modes.includes(appMode)) return null;
  return <>{children}</>;
}
