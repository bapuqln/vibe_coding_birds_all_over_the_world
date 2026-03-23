import type { ARSessionState } from "../types";

export interface ARState {
  sessionState: ARSessionState;
  isSupported: boolean;
}

export function checkARSupport(): boolean {
  if (typeof navigator === "undefined") return false;
  return "xr" in navigator;
}

export async function requestARSession(): Promise<XRSession | null> {
  if (!checkARSupport()) return null;
  try {
    const session = await navigator.xr!.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
    });
    return session;
  } catch {
    return null;
  }
}

export function createFallbackAR(): { cleanup: () => void } | null {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  return {
    cleanup: () => {},
  };
}
