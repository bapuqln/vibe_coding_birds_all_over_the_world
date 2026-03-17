export interface ShareCardData {
  birdNameZh: string;
  birdNameEn: string;
  region: string;
  funFact: string;
  badge?: string;
}

export function generateShareCard(data: ShareCardData): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(0.5, "#1e3a5f");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.arc(450, 200, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(data.birdNameZh, 40, 60);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText(data.birdNameEn, 40, 90);

    ctx.fillStyle = "rgba(96,165,250,0.8)";
    ctx.font = "14px system-ui, sans-serif";
    const regionLabel = `📍 ${data.region}`;
    ctx.fillText(regionLabel, 40, 125);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "15px system-ui, sans-serif";
    const words = data.funFact.split(" ");
    let line = "";
    let y = 170;
    const maxWidth = 520;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), 40, y);
        line = word + " ";
        y += 22;
        if (y > 320) break;
      } else {
        line = test;
      }
    }
    if (line && y <= 320) {
      ctx.fillText(line.trim(), 40, y);
    }

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("万羽拾音 — Kids Bird Globe", 40, 375);

    if (data.badge) {
      ctx.font = "48px system-ui, sans-serif";
      ctx.fillText(data.badge, 510, 370);
    }

    resolve(canvas.toDataURL("image/png"));
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProgressJson(data: Record<string, unknown>) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadDataUrl(url, `bird-globe-progress-${timestamp}.json`);
  URL.revokeObjectURL(url);
}
