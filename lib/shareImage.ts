// Draws the shareable "three things my guide noticed" image on a canvas.
// Drawn by hand (no screenshot library) so it always matches the brand and
// never breaks on modern CSS.

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
  ctx.beginPath();
  ctx.moveTo(0, H);
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(W, H);
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
