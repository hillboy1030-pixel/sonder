// Draws the shareable "three things my guide noticed" image on a canvas.
// Drawn by hand (no screenshot library) so it always matches the brand and
// never breaks on modern CSS.

import { cairnLayout, stonePath, type Stone } from "./cairn";

type Insight = { title: string; insight: string };

const W = 1080;
const H = 1350;
const PAD = 84;
const SIGN = '"National Park Variable", system-ui, sans-serif';
const READ = '"Literata Variable", Georgia, serif';

function firstSentences(text: string, n: number) {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  return (parts ? parts.slice(0, n).join("") : text).trim();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(" ")) last = last.slice(0, last.lastIndexOf(" "));
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function ridge(ctx: CanvasRenderingContext2D, points: [number, number][], color: string) {
  const h = ctx.canvas.height;
  ctx.beginPath();
  ctx.moveTo(0, h);
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(ctx.canvas.width, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export async function drawShareImage(insights: Insight[], host: string): Promise<Blob | null> {
  await Promise.all([
    document.fonts.load(`700 48px ${SIGN}`),
    document.fonts.load(`600 40px ${SIGN}`),
    document.fonts.load(`italic 400 30px ${READ}`),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#121F28");
  sky.addColorStop(0.55, "#1D3242");
  sky.addColorStop(0.82, "#3E5A6C");
  sky.addColorStop(1, "#8E9A95");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun glow behind the range
  const sun = ctx.createRadialGradient(780, 1130, 10, 780, 1130, 330);
  sun.addColorStop(0, "rgba(251,227,174,0.85)");
  sun.addColorStop(0.3, "rgba(244,196,111,0.35)");
  sun.addColorStop(1, "rgba(244,196,111,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 700, W, H - 700);

  // Ridges
  ridge(ctx, [[0, 1150], [140, 1100], [300, 1135], [470, 1060], [620, 1110], [760, 1030], [900, 1090], [1080, 1050]], "#5D717E");
  ridge(ctx, [[0, 1220], [180, 1170], [380, 1210], [560, 1150], [760, 1205], [940, 1160], [1080, 1190]], "#3B4D5B");
  ridge(ctx, [[0, 1290], [260, 1250], [540, 1280], [820, 1245], [1080, 1270]], "#13221D");

  // Wordmark
  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 46px ${SIGN}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Sonder", PAD, PAD + 40);
  ctx.fillStyle = "#E2A23B";
  ctx.beginPath();
  ctx.arc(PAD + ctx.measureText("Sonder").width + 22, PAD + 22, 9, 0, Math.PI * 2);
  ctx.fill();

  // Heading
  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 60px ${SIGN}`;
  ctx.fillText("Three things my", PAD, 250);
  ctx.fillText("guide noticed.", PAD, 320);

  // Insights
  let y = 420;
  const maxW = W - PAD * 2;
  insights.slice(0, 3).forEach((ins, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(PAD, y - 34, 4, 150);
    ctx.fillStyle = "#EDB75C";
    ctx.font = `600 38px ${SIGN}`;
    ctx.fillText(ins.title, PAD + 30, y);
    ctx.fillStyle = "rgba(246,248,247,0.88)";
    ctx.font = `italic 400 29px ${READ}`;
    const lines = wrap(ctx, firstSentences(ins.insight, 1), maxW - 30, 3);
    lines.forEach((ln, j) => ctx.fillText(ln, PAD + 30, y + 52 + j * 40));
    y += 52 + lines.length * 40 + (i < 2 ? 70 : 0);
  });

  // Footer
  ctx.fillStyle = "rgba(246,248,247,0.85)";
  ctx.font = `600 30px ${SIGN}`;
  const footer = host ? `Come inward. ${host}` : "Come inward.";
  ctx.fillText(footer, PAD, H - 50);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

// ─── Shared helpers ───────────────────────────────────────────────────────────


/** Shares through the phone's share sheet, or downloads on desktop. */
export async function deliverImage(blob: Blob, filename: string, title: string): Promise<boolean> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title, text: `Come inward: ${window.location.origin}` });
      return true;
    } catch (err) {
      void err;
      return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/** Draws a cairn with its base centered at (cx, baseY). */
export function drawCairn(ctx: CanvasRenderingContext2D, stones: Stone[], cx: number, baseY: number, scale: number) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 86, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const l of cairnLayout(stones)) {
    ctx.save();
    ctx.translate(l.cx, l.cy);
    ctx.rotate((l.tilt * Math.PI) / 180);
    const p = new Path2D(stonePath(l.w, l.h, l.stone.seed));
    ctx.fillStyle = l.stone.color;
    ctx.fill(p);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.stroke(p);
    ctx.translate(-l.w * 0.05, -l.h * 0.18);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fill(new Path2D(stonePath(l.w * 0.82, l.h * 0.5, l.stone.seed + 3)));
    ctx.restore();
  }
  ctx.restore();
}

function emberGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, r);
  g.addColorStop(0, "rgba(255,240,201,1)");
  g.addColorStop(0.25, "rgba(249,212,147,0.9)");
  g.addColorStop(1, "rgba(242,169,59,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A 9:16 story card for a stone (or the finished cairn). */
export async function shareStoryCard({
  stones,
  headline,
  detail,
  complete,
}: {
  stones: Stone[];
  headline: string;
  detail: string;
  complete: boolean;
}): Promise<boolean> {
  await Promise.all([
    document.fonts.load(`700 48px ${SIGN}`),
    document.fonts.load(`600 40px ${SIGN}`),
    document.fonts.load(`italic 400 30px ${READ}`),
  ]).catch(() => {});
  const SW = 1080;
  const SH = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = SW;
  canvas.height = SH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const sky = ctx.createLinearGradient(0, 0, 0, SH);
  sky.addColorStop(0, "#121F28");
  sky.addColorStop(0.5, "#1D3242");
  sky.addColorStop(0.8, "#3E5A6C");
  sky.addColorStop(1, "#8E9A95");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SW, SH);

  // stars
  ctx.fillStyle = "rgba(246,248,247,0.5)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 263) % SW;
    const y = (i * 151) % 700;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 46px ${SIGN}`;
  ctx.fillText("Sonder", 90, 150);
  ctx.fillStyle = "#E2A23B";
  ctx.beginPath();
  ctx.arc(90 + ctx.measureText("Sonder").width + 22, 132, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 76px ${SIGN}`;
  ctx.fillText(complete ? "My cairn" : "My cairn so far", 90, 300);

  // Cairn
  const baseY = 1120;
  if (complete) emberGlow(ctx, SW / 2, baseY - 600, 120);
  drawCairn(ctx, stones, SW / 2, baseY, 3);
  if (complete) {
    ctx.fillStyle = "#FFF3D6";
    ctx.beginPath();
    ctx.ellipse(SW / 2, baseY - 600, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Words, sized to fit
  ctx.textAlign = "center";
  ctx.fillStyle = "#EDB75C";
  const words = stones.map((s) => s.word).join("  ·  ");
  let fs = 60;
  do {
    ctx.font = `600 ${fs}px ${SIGN}`;
    fs -= 2;
  } while (ctx.measureText(words).width > SW - 160 && fs > 30);
  ctx.fillText(words, SW / 2, 1250);

  // Ember's line
  ctx.textAlign = "left";
  const line = detail || (complete ? "Four stones, one climb. This is the shape of you, for now." : "");
  let y = 1390;
  if (headline) {
    ctx.fillStyle = "#F6F8F7";
    ctx.font = `600 42px ${SIGN}`;
    wrap(ctx, headline, SW - 180, 2).forEach((ln) => {
      ctx.fillText(ln, 90, y);
      y += 54;
    });
    y += 20;
  }
  if (line) {
    ctx.fillStyle = "rgba(246,248,247,0.85)";
    ctx.font = `italic 400 38px ${READ}`;
    wrap(ctx, line, SW - 180, 4).forEach((ln) => {
      ctx.fillText(ln, 90, y);
      y += 54;
    });
  }

  ridge(ctx, [[0, 1770], [220, 1720], [480, 1755], [760, 1705], [1080, 1745]], "#3B4D5B");
  ridge(ctx, [[0, 1835], [300, 1800], [600, 1830], [900, 1795], [1080, 1820]], "#13221D");
  ctx.fillStyle = "rgba(246,248,247,0.85)";
  ctx.font = `600 32px ${SIGN}`;
  ctx.fillText(`Come inward. ${window.location.host}`, 90, SH - 40);

  const blob: Blob | null = await new Promise((r) => canvas.toBlob((b) => r(b), "image/png"));
  if (!blob) return false;
  return deliverImage(blob, complete ? "my-sonder-cairn.png" : "my-sonder-stone.png", complete ? "My cairn" : "My cairn so far");
}
