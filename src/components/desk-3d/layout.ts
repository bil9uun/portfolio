import { t, type Text } from "@/lib/i18n";

// Where everything sits on the two desks, in centimetres. The desk top is
// 160 × 80 cm, 75 cm off the floor, centred on the origin; +z points at the
// chair. Item names match src/content/uses.ts.

export type Vec3 = [number, number, number];

export type Model =
  | "monitor"
  | "keyboard"
  | "mouse"
  | "magic-mouse"
  | "mousepad"
  | "headset"
  | "case"
  | "laptop"
  // inside the PC
  | "motherboard"
  | "cpu"
  | "ram"
  | "gpu"
  | "cooler"
  | "psu"
  | "ssd";

export type Placed = {
  name: string;
  model: Model;
  at: Vec3;
  /** Turn round the vertical axis, in radians. */
  turn?: number;
  /** Where it flies to at full explode, relative to `at`. */
  explode: Vec3;
  /** Monitor panel size, for the two monitors and the Acer. */
  size?: [number, number];
};

export type TourStep = {
  label: Text;
  camera: Vec3;
  target: Vec3;
  /** Open the PC up for this step. */
  xray?: boolean;
  select?: string;
};

export type Desk = {
  id: "gaming" | "work";
  label: Text;
  items: Placed[];
  tour: TourStep[];
};

export const DESK_TOP = 75;

export const CASE = "Phanteks Eclipse G360A";

// Inside the case: positions relative to the case's bottom centre.
// The glass side faces -x (towards the middle of the desk).
export const PC_PARTS: Placed[] = [
  {
    name: "ASRock B850M Pro RS WiFi White",
    model: "motherboard",
    at: [8, 30, -4],
    explode: [14, 0, 0],
  },
  {
    name: "AMD Ryzen 7 7800X3D",
    model: "cpu",
    at: [6.4, 34, -4],
    explode: [-14, 10, -6],
  },
  {
    name: "Corsair Vengeance RGB DDR5",
    model: "ram",
    at: [5.6, 33, 6],
    explode: [-12, 14, 8],
  },
  {
    name: "ASUS Dual GeForce RTX 4070 White OC Edition",
    model: "gpu",
    at: [2.2, 22, -1],
    explode: [-24, -2, 4],
  },
  {
    name: "Cooler Master MasterLiquid ML360L V2 White Edition",
    model: "cooler",
    at: [0, 43.5, 0],
    explode: [0, 20, 0],
  },
  {
    name: "EVGA SuperNOVA 850 G5",
    model: "psu",
    at: [0, 4.6, -12],
    explode: [-18, 0, 16],
  },
  {
    name: "Samsung 980",
    model: "ssd",
    at: [7.4, 26, -12],
    explode: [-16, -6, -12],
  },
];

export const DESKS: Desk[] = [
  {
    id: "gaming",
    label: t("Gaming desk", "Тоглоомын ширээ"),
    items: [
      {
        name: "ASUS ROG Strix XG259QNSR-W",
        model: "monitor",
        at: [6, DESK_TOP, -24],
        explode: [0, 28, -10],
        size: [56, 33],
      },
      {
        name: "ASUS TUF Gaming VG259QM",
        model: "monitor",
        at: [-50, DESK_TOP, -16],
        turn: 0.45,
        explode: [-10, 24, -6],
        size: [56, 33],
      },
      {
        name: "ATK Sky XSoft",
        model: "mousepad",
        at: [8, DESK_TOP, 14],
        explode: [0, 4, 0],
      },
      {
        name: "ATK RS6+",
        model: "keyboard",
        at: [-4, DESK_TOP + 0.3, 16],
        turn: 0.08,
        explode: [0, 16, 4],
      },
      {
        name: "ATK Dragonfly Y9",
        model: "mouse",
        at: [22, DESK_TOP + 0.3, 18],
        explode: [6, 14, 4],
      },
      {
        name: "ATK Neptune N9 V2",
        model: "headset",
        at: [-58, DESK_TOP, 20],
        turn: -0.3,
        explode: [-6, 20, 4],
      },
      {
        name: CASE,
        model: "case",
        at: [60, DESK_TOP, -8],
        explode: [12, 22, 0],
      },
    ],
    tour: [
      {
        label: t("Overview", "Ерөнхий"),
        camera: [-55, 190, 215],
        target: [0, 92, 0],
      },
      {
        label: t("Monitors", "Дэлгэцүүд"),
        camera: [-8, 112, 64],
        target: [-10, 98, -20],
        select: "ASUS ROG Strix XG259QNSR-W",
      },
      {
        label: t("Keyboard & mouse", "Гар, хулгана"),
        camera: [10, 118, 66],
        target: [6, 76, 14],
        select: "ATK RS6+",
      },
      {
        label: t("Inside the PC", "Компьютерийн дотор"),
        camera: [-50, 168, 140],
        target: [50, 106, -6],
        xray: true,
        select: "ASUS Dual GeForce RTX 4070 White OC Edition",
      },
    ],
  },
  {
    id: "work",
    label: t("Work desk", "Ажлын ширээ"),
    items: [
      {
        name: "Acer 32″",
        model: "monitor",
        at: [0, DESK_TOP, -24],
        explode: [0, 28, -10],
        size: [71, 41],
      },
      {
        name: "MacBook Pro 14″",
        model: "laptop",
        at: [-44, DESK_TOP, 8],
        turn: 0.25,
        explode: [-8, 18, 4],
      },
      {
        name: "NuPhy Air60 V2",
        model: "keyboard",
        at: [2, DESK_TOP, 16],
        explode: [0, 16, 4],
      },
      {
        name: "Apple Magic Mouse 2",
        model: "magic-mouse",
        at: [26, DESK_TOP, 18],
        explode: [6, 14, 4],
      },
    ],
    tour: [
      {
        label: t("Overview", "Ерөнхий"),
        camera: [-40, 185, 205],
        target: [0, 92, 0],
      },
      {
        label: t("Monitor", "Дэлгэц"),
        camera: [0, 112, 70],
        target: [0, 100, -24],
        select: "Acer 32″",
      },
      {
        label: t("MacBook", "MacBook"),
        camera: [-20, 112, 52],
        target: [-44, 80, 8],
        select: "MacBook Pro 14″",
      },
      {
        label: t("Keyboard & mouse", "Гар, хулгана"),
        camera: [16, 112, 66],
        target: [10, 76, 16],
        select: "NuPhy Air60 V2",
      },
    ],
  },
];
