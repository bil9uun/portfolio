import { CanvasTexture, SRGBColorSpace } from "three";

// What the screens show, painted once onto a canvas: this site's hero on
// the main monitor, an editor everywhere else.
export type ScreenKind = "site" | "code";

const cache = new Map<ScreenKind, CanvasTexture>();

const INK = "#0D0F0C";
const BONE = "#ECEDE6";
const FOG = "#8B9187";
const SIGNAL = "#22C55E";
const SYNTAX = ["#A57BFF", "#4D8DFF", "#2EC4D6", "#FFB020", "#FF5CA8", FOG];

function paint(kind: ScreenKind) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 600;
  const g = c.getContext("2d")!;
  g.fillStyle = INK;
  g.fillRect(0, 0, c.width, c.height);

  if (kind === "site") {
    // Dotted canvas, the name, the role line and a few swarm tags.
    g.fillStyle = "rgba(236,237,230,0.08)";
    for (let x = 16; x < c.width; x += 32)
      for (let y = 16; y < c.height; y += 32) g.fillRect(x, y, 2, 2);
    g.fillStyle = BONE;
    g.font = "700 150px 'Bricolage Grotesque', sans-serif";
    g.textAlign = "center";
    g.fillText("B.Bilguun", c.width / 2, 330);
    g.fillStyle = SIGNAL;
    g.beginPath();
    g.arc(c.width / 2 - 205, 318, 15, 0, Math.PI * 2);
    g.fill();
    g.font = "500 30px 'Montserrat', sans-serif";
    g.fillStyle = FOG;
    g.fillText("SOFTWARE ENGINEER, FULL STACK DEVELOPER", c.width / 2, 410);
    [
      ["React", "#61DAFB", 180, 160],
      ["TypeScript", "#4D8DFF", 760, 190],
      ["Next.js", BONE, 820, 470],
      ["Tailwind", "#A57BFF", 150, 480],
    ].forEach(([label, color, x, y]) => {
      g.fillStyle = color as string;
      g.beginPath();
      g.roundRect(x as number, y as number, 150, 36, 18);
      g.fill();
      g.fillStyle = INK;
      g.font = "500 22px 'JetBrains Mono', monospace";
      g.fillText(label as string, (x as number) + 75, (y as number) + 26);
    });
    g.strokeStyle = SIGNAL;
    g.lineWidth = 3;
    g.strokeRect(200, 200, 624, 160);
  } else {
    // An editor: sidebar, tab bar, line numbers, syntax-coloured lines.
    g.fillStyle = "#151814";
    g.fillRect(0, 0, 200, c.height);
    g.fillRect(200, 0, c.width - 200, 44);
    g.fillStyle = "#22261F";
    g.fillRect(200, 0, 200, 44);
    for (let i = 0; i < 12; i++) {
      g.fillStyle = i === 3 ? SIGNAL : "#3A3F37";
      g.fillRect(28, 70 + i * 38, 90 + ((i * 37) % 60), 10);
    }
    let seed = kind.length * 7;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let line = 0; line < 22; line++) {
      const y = 76 + line * 24;
      g.fillStyle = "#3A3F37";
      g.fillRect(214, y, 18, 8);
      let x = 250 + Math.floor(rand() * 4) * 26;
      const words = 2 + Math.floor(rand() * 5);
      for (let w = 0; w < words && x < c.width - 40; w++) {
        const width = 30 + rand() * 110;
        g.fillStyle = SYNTAX[Math.floor(rand() * SYNTAX.length)];
        g.fillRect(x, y, width, 9);
        x += width + 12;
      }
    }
  }

  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function screenTexture(kind: ScreenKind) {
  let texture = cache.get(kind);
  if (!texture) {
    texture = paint(kind);
    cache.set(kind, texture);
  }
  return texture;
}
