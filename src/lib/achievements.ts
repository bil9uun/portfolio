import { t, langStore, type Text } from "@/lib/i18n";
import { blip } from "@/lib/sound";
import {
  chatOpen,
  createStore,
  inspectMode,
  paletteOpen,
  readSetting,
  replayCount,
  terminalOpen,
  writeSetting,
} from "@/lib/store";

// Small rewards for finding the site's hidden corners. Kept in this browser.

export type Achievement = { id: string; title: Text; hint: Text };

export const achievements: Achievement[] = [
  {
    id: "palette",
    title: t("Command center", "Удирдлагын төв"),
    hint: t("Press ⌘K", "⌘K дар"),
  },
  {
    id: "terminal",
    title: t("Hacker voice", "Хакерын хоолой"),
    hint: t("Press ` to open the terminal", "Terminal нээхийн тулд ` дар"),
  },
  {
    id: "sudo",
    title: t("Hired", "Ажилд авлаа"),
    hint: t(
      "Ask the terminal nicely, with sudo",
      "Terminal-аас sudo-гоор эелдэг гуй",
    ),
  },
  {
    id: "konami",
    title: t("Old school", "Хуучны тоглогч"),
    hint: t("A famous cheat code", "Алдартай cheat code"),
  },
  {
    id: "inspect",
    title: t("Pixel peeper", "Пиксел шинжээч"),
    hint: t("Press I", "I дар"),
  },
  {
    id: "chat",
    title: t("Small talk", "Жаахан яриа"),
    hint: t("Press /", "/ дар"),
  },
  {
    id: "replay",
    title: t("Encore", "Дахиад нэг"),
    hint: t("Replay the build", "Сайтыг дахин бүтээ"),
  },
  {
    id: "lang",
    title: t("Bilingual", "Хоёр хэлтэн"),
    hint: t("Switch the language", "Хэлээ соль"),
  },
  {
    id: "case",
    title: t("Deep dive", "Гүнзгий судлаач"),
    hint: t("Read a case study", "Төслийн дэлгэрэнгүйг унш"),
  },
  {
    id: "player",
    title: t("Player one", "Нэгдүгээр тоглогч"),
    hint: t("Open a game", "Тоглоом нээ"),
  },
  {
    id: "cv",
    title: t("Paper trail", "Цаасан мөр"),
    hint: t("Print the CV", "CV-г хэвлэ"),
  },
  {
    id: "bottom",
    title: t("The end", "Төгсгөл"),
    hint: t("Reach the very bottom", "Хамгийн доод хэсэгт хүр"),
  },
];

const KEY = "achievements";
const load = () => {
  try {
    const ids = JSON.parse(readSetting(KEY) ?? "[]");
    return new Set<string>(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set<string>();
  }
};

export const unlocked = createStore<Set<string>>(load());
// The latest unlock, for the toast. `at` makes each one a new value.
export const lastUnlock = createStore<{
  achievement: Achievement;
  at: number;
} | null>(null);

export function unlock(id: string) {
  const achievement = achievements.find((a) => a.id === id);
  if (!achievement || unlocked.get().has(id)) return;
  const next = new Set(unlocked.get()).add(id);
  unlocked.set(next);
  writeSetting(KEY, JSON.stringify([...next]));
  lastUnlock.set({ achievement, at: performance.now() });
  blip({ size: 0.2, pitch: 1.5 });
  setTimeout(() => blip({ size: 0, pitch: 1.5 }), 110);
}

// Unlock when a page-wide mode turns on.
const onTrue = (
  store: { get: () => boolean; subscribe: (l: () => void) => void },
  id: string,
) => store.subscribe(() => store.get() && unlock(id));
onTrue(paletteOpen, "palette");
onTrue(terminalOpen, "terminal");
onTrue(inspectMode, "inspect");
onTrue(chatOpen, "chat");
replayCount.subscribe(() => unlock("replay"));
langStore.subscribe(() => unlock("lang"));
