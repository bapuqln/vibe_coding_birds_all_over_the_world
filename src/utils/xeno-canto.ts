import type { XenoCantoResponse } from "../types";

const XENO_CANTO_API = "https://xeno-canto.org/api/2/recordings";
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function fetchWithCorsRetry(
  url: string,
  signal?: AbortSignal,
): Promise<Response> {
  try {
    const res = await fetch(url, { signal });
    if (res.ok) return res;
  } catch {
    // direct fetch failed, try proxies
  }

  for (const makeProxy of CORS_PROXIES) {
    try {
      const res = await fetch(makeProxy(url), { signal });
      if (res.ok) return res;
    } catch {
      continue;
    }
  }

  throw new Error("All fetch attempts failed for xeno-canto API");
}

export async function fetchBirdAudio(
  query: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${XENO_CANTO_API}?query=${encodeURIComponent(query)}+q:A`;

  const response = await fetchWithCorsRetry(url, signal);

  let data: XenoCantoResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Failed to parse xeno-canto response as JSON (status: ${response.status})`,
    );
  }

  if (!data.recordings || data.recordings.length === 0) {
    return null;
  }

  const bestRecording =
    data.recordings.find((r) => r.q === "A") || data.recordings[0];

  let audioUrl = bestRecording.file;
  if (audioUrl.startsWith("//")) {
    audioUrl = `https:${audioUrl}`;
  }

  return audioUrl;
}
