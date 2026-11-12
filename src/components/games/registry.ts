import { lazy, type ComponentType } from "react";
import { t, type Text } from "@/lib/i18n";

export type Game = {
  id: string;
  title: Text;
  blurb: Text;
  /** How the best result reads on the hub card. */
  best: (value: number) => Text;
  color: string;
  Component: ComponentType;
};

const same = (text: string) => t(text, text);
const time = (s: number) => same(`${s.toFixed(1)}s`);

// Each game loads on its own, only when opened.
export const games: Game[] = [
  {
    id: "snake",
    title: t("Cursor Snake", "Cursor Snake"),
    blurb: t(
      "Eat the stack one skill at a time. Every skill joins the line as a cursor.",
      "Stack-аа нэг нэгээр нь идээрэй. Идсэн skill бүр cursor болж цуваанд нэгдэнэ.",
    ),
    best: (v) => same(`${v}`),
    color: "#22C55E",
    Component: lazy(() => import("@/components/snake")),
  },
  {
    id: "herd",
    title: t("Cursor Herding", "Cursor хөөх"),
    blurb: t(
      "The cursors run from your pointer. Herd every one of them into the frame.",
      "Cursor-ууд таны заагчаас зугтдаг. Бүгдийг нь frame дотор хөөж оруулаарай.",
    ),
    best: time,
    color: "#FF5CA8",
    Component: lazy(() => import("@/components/games/herd")),
  },
  {
    id: "pixel",
    title: t("Pixel Perfect", "Pixel Perfect"),
    blurb: t(
      "Draw a frame of an exact size by eye. Five rounds, every pixel counts.",
      "Яг заасан хэмжээтэй frame-ийг нүдээр зурна. 5 тойрог, пиксел бүр чухал.",
    ),
    best: (v) => same(`${v}/500`),
    color: "#4D8DFF",
    Component: lazy(() => import("@/components/games/pixel")),
  },
  {
    id: "platform",
    title: t("Frame Runner", "Frame Runner"),
    blurb: t(
      "Run and jump across selection frames, collect the stack and ship it.",
      "Selection frame-үүд дээгүүр гүйж үсэрч, stack цуглуулаад ship хийнэ.",
    ),
    best: time,
    color: "#FFB020",
    Component: lazy(() => import("@/components/games/platform")),
  },
  {
    id: "bugs",
    title: t("Bug Hunt", "Bug Hunt"),
    blurb: t(
      "Every number counts the bugs around it. Clear the codebase without opening one.",
      "Тоо бүр эргэн тойрныхоо bug-ийн тоог заана. Bug нээлгүйгээр codebase-ийг цэвэрлэ.",
    ),
    best: time,
    color: "#FF6B6B",
    Component: lazy(() => import("@/components/games/bugs")),
  },
  {
    id: "typing",
    title: t("Code Typing", "Код бичих уралдаан"),
    blurb: t(
      "Type real-world React and TypeScript as fast and clean as you can.",
      "React, TypeScript кодыг аль болох хурдан, алдаагүй бичээрэй.",
    ),
    best: (v) => same(`${v} WPM`),
    color: "#A57BFF",
    Component: lazy(() => import("@/components/games/typing")),
  },
  {
    id: "chess",
    title: t("Chess", "Шатар"),
    blurb: t(
      "A game of chess against the computer, at three levels.",
      "Компьютерийн эсрэг шатар, гурван түвшинтэй.",
    ),
    best: (v) => t(`${v} wins`, `${v} хожил`),
    color: "#2EC4D6",
    Component: lazy(() => import("@/components/games/chess")),
  },
];

export const findGame = (id: string) => games.find((game) => game.id === id);
