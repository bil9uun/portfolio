import type { ArtKind } from "@/components/illustrations/art-kinds";
import { same, t, type Text } from "@/lib/i18n";

// The /uses page: the hardware and software I work and play with.
// `color` is the finish of the item, when I know it; it draws the swatch.

export type Finish = "white" | "silver" | "black" | "gray";

export type UseItem = {
  kind: Text;
  name: string;
  detail?: Text;
  color?: Finish;
  /** How the item is drawn on the desk and its card. */
  art?: ArtKind;
  url?: string;
};

export type UseGroup = {
  /** Hardware groups feed the colour strip; software has no finish. */
  hardware?: boolean;
  id: string;
  title: Text;
  note?: Text;
  items: UseItem[];
};

export const finishes: Record<Finish, { hex: string; label: Text }> = {
  white: { hex: "#F2F2EA", label: t("White", "Цагаан") },
  silver: { hex: "#C9CCD1", label: t("Silver", "Мөнгөлөг") },
  black: { hex: "#1A1C19", label: t("Black", "Хар") },
  gray: { hex: "#8B9096", label: t("Gray", "Саарал") },
};

export const useGroups: UseGroup[] = [
  {
    id: "work",
    hardware: true,
    title: t("Work", "Ажил"),
    note: t("Where the code gets written.", "Код бичигддэг газар."),
    items: [
      {
        kind: t("Laptop", "Зөөврийн компьютер"),
        name: "MacBook Pro 14″",
        art: "laptop",
        detail: same("M3 Pro · 18 GB · 512 GB"),
        color: "silver",
      },
      {
        kind: t("Monitor", "Дэлгэц"),
        name: "Acer 32″",
        art: "monitor",
        detail: same("144 Hz"),
        color: "black",
      },
      {
        kind: t("Keyboard", "Гар"),
        name: "NuPhy Air60 V2",
        art: "keyboard",
        detail: t("Lunar Gray · Red switches", "Lunar Gray · Red switch"),
        color: "gray",
      },
      {
        kind: t("Mouse", "Хулгана"),
        name: "Apple Magic Mouse 2",
        art: "magic-mouse",
        color: "white",
      },
    ],
  },
  {
    id: "pc",
    hardware: true,
    title: t("Gaming PC", "Тоглоомын компьютер"),
    note: t(
      "A white build, part by part.",
      "Цагаан өнгөөр угсарсан компьютер, эд анги бүрээр.",
    ),
    items: [
      {
        kind: t("CPU", "Процессор"),
        name: "AMD Ryzen 7 7800X3D",
        art: "cpu",
      },
      {
        kind: t("Graphics", "Видео карт"),
        name: "ASUS Dual GeForce RTX 4070 White OC Edition",
        art: "gpu",
        detail: same("12 GB"),
        color: "white",
      },
      {
        kind: t("Motherboard", "Эх хавтан"),
        name: "ASRock B850M Pro RS WiFi White",
        art: "motherboard",
        color: "white",
        url: "https://asrock.com/mb/AMD/B850M%20Pro%20RS%20WiFi%20White/index.asp",
      },
      {
        kind: t("Memory", "Санах ой"),
        name: "Corsair Vengeance RGB DDR5",
        art: "ram",
        detail: same("2 × 16 GB · 6000 MHz"),
        color: "white",
      },
      {
        kind: t("Cooling", "Хөргөлт"),
        name: "Cooler Master MasterLiquid ML360L V2 White Edition",
        art: "cooler",
        color: "white",
      },
      {
        kind: t("Storage", "Хадгалах төхөөрөмж"),
        name: "Samsung 980",
        art: "ssd",
        detail: same("500 GB · PCIe NVMe"),
      },
      {
        kind: t("Power", "Тэжээл"),
        name: "EVGA SuperNOVA 850 G5",
        art: "psu",
        detail: same("850 W"),
      },
      {
        kind: t("Case", "Кейс"),
        name: "Phanteks Eclipse G360A",
        art: "case",
        color: "white",
      },
    ],
  },
  {
    id: "desk",
    hardware: true,
    title: t("Gaming desk", "Тоглоомын ширээ"),
    items: [
      {
        kind: t("Monitor", "Дэлгэц"),
        name: "ASUS ROG Strix XG259QNSR-W",
        art: "monitor",
        detail: same("24.5″ · 1920 × 1080 · 420 Hz"),
        color: "white",
      },
      {
        kind: t("Second monitor", "Хоёр дахь дэлгэц"),
        name: "ASUS TUF Gaming VG259QM",
        art: "monitor",
        detail: same("24.5″ IPS · 280 Hz"),
        color: "black",
      },
      {
        kind: t("Keyboard", "Гар"),
        name: "ATK RS6+",
        art: "keyboard",
        detail: t(
          "Aluminium, magnetic switches · White Samurai",
          "Хөнгөн цагаан, соронзон switch · White Samurai",
        ),
        color: "white",
      },
      {
        kind: t("Mouse", "Хулгана"),
        name: "ATK Dragonfly Y9",
        art: "mouse",
        detail: t("Wireless · Ultimate White", "Утасгүй · Ultimate White"),
        color: "white",
      },
      {
        kind: t("Mouse pad", "Хулганы дэвсгэр"),
        name: "ATK Sky XSoft",
        art: "mousepad",
        color: "black",
      },
      {
        kind: t("Headset", "Чихэвч"),
        name: "ATK Neptune N9 V2",
        art: "headset",
        detail: t("Wireless", "Утасгүй"),
        color: "white",
      },
    ],
  },
  {
    id: "software",
    title: t("Software", "Программ хангамж"),
    note: t("What's open all day.", "Өдөржин нээлттэй байдаг зүйлс."),
    items: [
      {
        kind: t("Editor", "Editor"),
        name: "Visual Studio Code",
        detail: t(
          "Visual Studio 2017 Dark theme · Prettier on save",
          "Visual Studio 2017 Dark theme · хадгалахад Prettier",
        ),
      },
      {
        kind: t("Extensions", "Extension"),
        name: "ESLint · Prettier · Tailwind CSS IntelliSense · GitLens · Prisma",
      },
      {
        kind: t("Terminal", "Terminal"),
        name: "Warp",
        detail: same("zsh"),
      },
      {
        kind: t("AI", "AI"),
        name: "Claude Code",
      },
      {
        kind: t("Browser", "Хөтөч"),
        name: "Google Chrome",
      },
      {
        kind: t("Design", "Дизайн"),
        name: "Figma",
      },
      {
        kind: t("API", "API"),
        name: "Postman",
      },
      {
        kind: t("Databases", "Өгөгдлийн сан"),
        name: "DBeaver · MongoDB Compass",
        detail: same("PostgreSQL · Redis"),
      },
      {
        kind: t("Containers", "Container"),
        name: "Docker",
      },
      {
        kind: t("JavaScript", "JavaScript"),
        name: "Node.js · Bun",
        detail: t("nvm · pnpm · Yarn", "nvm · pnpm · Yarn"),
      },
      {
        kind: t("Command line", "Command line"),
        name: "Homebrew · GitHub CLI",
      },
      {
        kind: t("Windows", "Цонх"),
        name: "Rectangle",
        detail: t("Window snapping on macOS", "macOS дээр цонх байрлуулах"),
      },
      {
        kind: t("3D", "3D"),
        name: "Blender",
      },
    ],
  },
  {
    id: "site",
    title: t("This site", "Энэ сайт"),
    note: t("Built with", "Юугаар хийгдсэн"),
    items: [
      {
        kind: t("Framework", "Framework"),
        name: "React 19 · Vite · TypeScript",
      },
      {
        kind: t("Routing", "Routing"),
        name: "TanStack Router",
      },
      {
        kind: t("Styling", "Styling"),
        name: "Tailwind CSS v4",
      },
      {
        kind: t("Motion", "Хөдөлгөөн"),
        name: "GSAP · ScrollTrigger · ScrollSmoother",
        detail: t(
          "The swarm, the 3D field and the sounds are hand-written",
          "Swarm, 3D background, дуунууд нь өөрөө бичсэн код",
        ),
      },
      {
        kind: t("Physics", "Физик"),
        name: "matter-js",
        detail: t("The skill pile", "Skill-ийн овоолго"),
      },
      {
        kind: t("Chess", "Шатар"),
        name: "chess.js",
      },
      {
        kind: t("Fonts", "Font"),
        name: "Bricolage Grotesque · Montserrat · JetBrains Mono",
        detail: t("Geologica for Mongolian", "Монгол үсэгт Geologica"),
      },
    ],
  },
];
