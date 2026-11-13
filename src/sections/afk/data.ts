import gaming from "@/content/gaming.json";
import { t, type Lang } from "@/lib/i18n";
import { createStore } from "@/lib/store";

// Data, copy and formatting shared by the off-the-clock HUD.

export type Faceit = NonNullable<typeof gaming.faceit>;
export type Match = Faceit["matches"][number];

export const WIN = "#22C55E";
export const LOSS = "#FF5C5C";

// FACEIT CS2 levels: the ELO each one starts at.
export const LEVELS = [100, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001];

export const copy = {
  intro: t(
    "When I'm not coding, I play Counter-Strike 2, mostly on FACEIT. Here's how it's going.",
    "Код бичээгүй үедээ Counter-Strike 2 тоглодог, ихэвчлэн FACEIT дээр. Одоогийн байдал:",
  ),
  updated: (date: string) => t(`Snapshot · ${date}`, `${date}-ны байдлаар`),
  level: t("Level", "Түвшин"),
  toNext: (elo: number, level: number) =>
    t(`${elo} ELO to level ${level}`, `${level}-р түвшин хүртэл ${elo} ELO`),
  maxLevel: t("Top level", "Дээд түвшин"),
  rank: (region: string) => t(`${region} rank`, `${region} бүсэд`),
  since: (year: number) => t(`since ${year}`, `${year} оноос`),
  eloTrend: (n: number) =>
    t(`ELO · last ${n} matches`, `ELO · сүүлийн ${n} тоглолт`),
  matches: t("Matches", "Тоглолт"),
  winRate: t("Win rate", "Ялалт"),
  kd: t("K/D", "K/D"),
  hs: t("Headshot", "Headshot"),
  adr: t("ADR", "ADR"),
  streak: t("Best streak", "Дараалсан ялалт"),
  scoreboard: t("Recent matches", "Сүүлийн тоглолтууд"),
  map: t("Map", "Map"),
  score: t("Score", "Оноо"),
  kda: t("K / D / A", "K / D / A"),
  date: t("Date", "Огноо"),
  maps: (n: number) => t(`Maps · last ${n}`, `Map · сүүлийн ${n}`),
  played: (n: number) => t(`${n} played`, `${n} тоглолт`),
  win: t("W", "Я"),
  loss: t("L", "Х"),
  steamLevel: t("Level", "Түвшин"),
  vac: t("No VAC bans", "VAC ban байхгүй"),
  cs2Hours: t("Hours in CS2", "CS2 цаг"),
  twoWeeks: t("Past 2 weeks", "Сүүлийн 2 долоо хоног"),
  badges: t("Badges", "Badge"),
  games: t("Games", "Тоглоом"),
  friends: t("Friends", "Найз"),
  recentlyPlayed: t("Recently played", "Сүүлд тоглосон"),
  hours: t("h", "ц"),
  last: (date: string) => t(`last ${date}`, `сүүлд ${date}`),
};

export const locale = (lang: Lang) => (lang === "mn" ? "mn-MN" : "en-US");
export const shortDate = (iso: string, lang: Lang) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return lang === "mn"
    ? `${d.getUTCMonth() + 1}.${String(d.getUTCDate()).padStart(2, "0")}`
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
export const mapName = (m: string) => m.charAt(0).toUpperCase() + m.slice(1);

// Set once the HUD scrolls into view; every Count then runs up to its value.
export const hudOnline = createStore(false);
