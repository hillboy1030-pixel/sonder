// Draws the one shareable image in Sonder: "Three things Ember noticed about me".
// A 9:16 story card built from the share lines Ember writes to be safe to post
// (never the private insight text). Drawn by hand on a canvas so it always
// matches the brand and never breaks on modern CSS.

export type ShareInsight = { title: string; insight: string; shareLine?: string };

const W = 1080;
const H = 1920;
const PAD = 90;
const SIGN = '"National Park Variable", system-ui, sans-serif';
const READ = '"Literata Variable", Georgia, serif';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
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

function loadImage(svg: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

type Block = { title: string; line: string };

/** Lays out the three blocks at a font size; returns the height they need. */
function measure(ctx: CanvasRenderingContext2D, blocks: Block[], size: number) {
  const titleSize = Math.round(size * 0.66);
  const lead = Math.round(size * 1.3);
  const gap = Math.round(size * 1.35);
  const maxW = W - PAD * 2 - 36;
  ctx.font = `400 ${size}px ${READ}`;
  const laid = blocks.map((b) => ({ ...b, lines: b.line ? wrap(ctx, `“${b.line}”`, maxW) : [] }));
  const height = laid.reduce((h, b, i) => h + titleSize * 1.4 + b.lines.length * lead + (i < laid.length - 1 ? gap : 0), 0);
  return { laid, height, titleSize, lead, gap };
}

export async function drawInsightsCard({
  insights,
  words,
  emberSvg,
  host,
}: {
  insights: ShareInsight[];
  words: string[];
  emberSvg?: string;
  host: string;
}): Promise<Blob | null> {
  await Promise.all([
    document.fonts.load(`700 64px ${SIGN}`),
    document.fonts.load(`600 36px ${SIGN}`),
    document.fonts.load(`400 50px ${READ}`),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.textBaseline = "alphabetic";

  // Night sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#111D26");
  sky.addColorStop(0.55, "#1B3040");
  sky.addColorStop(0.85, "#3B5668");
  sky.addColorStop(1, "#7F8E8A");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(246,248,247,0.45)";
  for (let i = 0; i < 46; i++) ctx.fillRect((i * 263) % W, (i * 151) % 640, 2, 2);

  // First light behind the ridge
  const sun = ctx.createRadialGradient(760, 1740, 10, 760, 1740, 420);
  sun.addColorStop(0, "rgba(251,227,174,0.75)");
  sun.addColorStop(0.35, "rgba(244,196,111,0.28)");
  sun.addColorStop(1, "rgba(244,196,111,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 1250, W, H - 1250);

  // Wordmark
  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 44px ${SIGN}`;
  ctx.fillText("Sonder", PAD, 140);
  ctx.fillStyle = "#E2A23B";
  ctx.beginPath();
  ctx.arc(PAD + ctx.measureText("Sonder").width + 20, 122, 8, 0, Math.PI * 2);
  ctx.fill();

  // Ember and the heading
  const ember = emberSvg ? await loadImage(emberSvg) : null;
  const headX = ember ? PAD + 176 : PAD;
  if (ember) {
    const glow = ctx.createRadialGradient(PAD + 75, 290, 10, PAD + 75, 290, 130);
    glow.addColorStop(0, "rgba(249,212,147,0.35)");
    glow.addColorStop(1, "rgba(249,212,147,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(PAD - 60, 160, 270, 270);
    ctx.drawImage(ember, PAD, 215, 150, 150);
  }
  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 62px ${SIGN}`;
  ctx.fillText("Three things Ember", headX, 280);
  ctx.fillText("noticed about me.", headX, 352);

  // The three insights: title as a small label, the share line as the hero
  const blocks: Block[] = insights.slice(0, 3).map((i) => ({ title: i.title, line: (i.shareLine ?? "").trim() }));
  const top = 500;
  const bottom = words.length ? 1530 : 1600;
  let size = 52;
  let m = measure(ctx, blocks, size);
  while (m.height > bottom - top && size > 34) {
    size -= 2;
    m = measure(ctx, blocks, size);
  }
  let y = top + Math.max(0, (bottom - top - m.height) / 2) + m.titleSize;
  m.laid.forEach((b, i) => {
    const blockTop = y - m.titleSize;
    ctx.fillStyle = "#EDB75C";
    ctx.font = `600 ${m.titleSize}px ${SIGN}`;
    ctx.fillText(b.title, PAD + 36, y);
    y += m.titleSize * 0.4;
    ctx.fillStyle = "#F6F8F7";
    ctx.font = `400 ${size}px ${READ}`;
    b.lines.forEach((ln) => {
      y += m.lead;
      ctx.fillText(ln, PAD + 36, y - m.lead * 0.22);
    });
    ctx.fillStyle = "rgba(237,183,92,0.55)";
    ctx.fillRect(PAD, blockTop + 4, 5, y - blockTop - 4);
    y += (i < m.laid.length - 1 ? m.gap : 0) + m.titleSize;
  });

  // The four words from the climb
  if (words.length) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(246,248,247,0.7)";
    let fs = 34;
    const text = words.join("  ·  ");
    do {
      ctx.font = `600 ${fs}px ${SIGN}`;
      fs -= 2;
    } while (ctx.measureText(text).width > W - PAD * 2 && fs > 24);
    ctx.fillText(text, W / 2, 1610);
    ctx.textAlign = "left";
  }

  // Ridges and the invitation
  ridge(ctx, [[0, 1700], [180, 1660], [400, 1690], [620, 1640], [860, 1680], [1080, 1650]], "#4D6271");
  ridge(ctx, [[0, 1745], [260, 1715], [520, 1740], [800, 1705], [1080, 1730]], "#2F4150");
  ridge(ctx, [[0, 1780], [300, 1758], [640, 1775], [1080, 1752]], "#13221D");
  ctx.textAlign = "center";
  ctx.fillStyle = "#F6F8F7";
  ctx.font = `700 40px ${SIGN}`;
  ctx.fillText("What would Ember notice about you?", W / 2, 1838);
  ctx.fillStyle = "#EDB75C";
  ctx.font = `600 32px ${SIGN}`;
  ctx.fillText(host || "Sonder", W / 2, 1888);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
