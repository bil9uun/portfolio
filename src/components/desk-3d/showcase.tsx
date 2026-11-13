import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, PerspectiveCamera, View } from "@react-three/drei";
import type { Group } from "three";
import { useGroups } from "@/content/uses";
import { prefersReducedMotion } from "@/lib/gsap";
import {
  CASE,
  DESKS,
  PC_PARTS,
  type Placed,
} from "@/components/desk-3d/layout";
import {
  Case,
  Cooler,
  Cpu,
  CpuChip,
  ErgoMouse,
  Gpu,
  Headset,
  Keyboard,
  Laptop,
  MagicMouse,
  Monitor,
  Motherboard,
  Mousepad,
  Psu,
  Ram,
  Ssd,
} from "@/components/desk-3d/models";

// One canvas for every model card on /uses: each card is a drei <View>,
// a window into the shared canvas (browsers allow only ~16 WebGL contexts).

const finishOf = (name: string) =>
  useGroups.flatMap((g) => g.items).find((i) => i.name === name)?.color;

const placed = new Map<string, Placed>(
  [...DESKS.flatMap((d) => d.items), ...PC_PARTS].map((p) => [p.name, p]),
);

// The model for an item, turned to show its best side to the camera.
function Presented({ name }: { name: string }) {
  const p = placed.get(name);
  const finish = finishOf(name);
  if (name === "AMD Ryzen 7 7800X3D")
    return (
      <group rotation={[0.5, 0, 0]}>
        <CpuChip />
      </group>
    );
  if (!p) return null;
  switch (p.model) {
    case "monitor":
      return (
        <Monitor
          finish={finish}
          size={p.size ?? [56, 33]}
          screen={name === "ASUS ROG Strix XG259QNSR-W" ? "site" : "code"}
        />
      );
    case "keyboard":
      return (
        <group rotation={[0.45, 0, 0]}>
          {name === "NuPhy Air60 V2" ? (
            <Keyboard finish={finish} lowProfile w={29.3} d={11.2} />
          ) : (
            <Keyboard finish={finish} />
          )}
        </group>
      );
    case "mouse":
      return (
        <group rotation={[0.35, 0, 0]}>
          <ErgoMouse finish={finish} />
        </group>
      );
    case "magic-mouse":
      return (
        <group rotation={[0.35, 0, 0]}>
          <MagicMouse finish={finish} />
        </group>
      );
    case "mousepad":
      return (
        <group rotation={[0.55, 0, 0]}>
          <Mousepad finish={finish} />
        </group>
      );
    case "headset":
      return (
        <group rotation={[0.6, 0, 0]}>
          <Headset finish={finish} />
        </group>
      );
    case "laptop":
      return <Laptop finish={finish} />;
    case "case":
      return (
        <Case finish={finish}>
          {PC_PARTS.map((part) => (
            <group key={part.name} position={part.at}>
              <Part name={part.name} />
            </group>
          ))}
        </Case>
      );
    case "motherboard":
      return (
        <group rotation={[0, Math.PI / 2, 0]}>
          <Motherboard finish={finish} />
        </group>
      );
    case "ram":
      return (
        <group rotation={[0, Math.PI / 2, 0.3]}>
          <Ram finish={finish} />
        </group>
      );
    case "gpu":
      // Fans to the camera, card lying flat.
      return (
        <group rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Gpu finish={finish} />
          </group>
        </group>
      );
    case "cooler":
      return (
        <group rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Cooler finish={finish} />
          </group>
        </group>
      );
    case "psu":
      return (
        <group rotation={[0.5, 0, 0]}>
          <Psu />
        </group>
      );
    case "ssd":
      return (
        <group rotation={[0, Math.PI / 2, 0]}>
          <Ssd />
        </group>
      );
    default:
      return null;
  }
}

// The PC's parts as they sit inside the case (no presentation turn).
function Part({ name }: { name: string }) {
  const finish = finishOf(name);
  switch (placed.get(name)?.model) {
    case "motherboard":
      return <Motherboard finish={finish} />;
    case "cpu":
      return <Cpu />;
    case "ram":
      return <Ram finish={finish} />;
    case "gpu":
      return <Gpu finish={finish} />;
    case "cooler":
      return <Cooler finish={finish} />;
    case "psu":
      return <Psu />;
    case "ssd":
      return <Ssd />;
    default:
      return null;
  }
}

// A gentle sway either side of the model's best angle (a full turn would
// show its back half the time). Still for visitors who prefer less motion.
function Sway({ children, turn }: { children: ReactNode; turn: number }) {
  const g = useRef<Group>(null);
  const still = prefersReducedMotion();
  useFrame(({ clock }) => {
    if (!still && g.current)
      g.current.rotation.y = turn + Math.sin(clock.elapsedTime * 0.6) * 0.45;
  });
  return (
    <group ref={g} rotation={[0, turn, 0]}>
      {children}
    </group>
  );
}

/** A model card's window. Put it inside a positioned box. */
export function ModelView({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  // The case is shown from the glass side; everything else three-quarters.
  const turn = name === CASE ? 0.6 : -0.5;
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 40, 120]} fov={28} />
      <hemisphereLight args={["#ECEDE6", "#1A1C19", 1.1]} />
      <directionalLight position={[60, 120, 90]} intensity={1.8} />
      <directionalLight
        position={[-80, 40, -60]}
        intensity={0.5}
        color="#2EC4D6"
      />
      <Bounds fit clip observe margin={1.25}>
        <Sway turn={turn}>
          <Presented name={name} />
        </Sway>
      </Bounds>
    </View>
  );
}

/** The shared canvas behind every ModelView, fixed over the page. */
export function ShowcaseCanvas() {
  return createPortal(
    <Canvas
      eventSource={document.body}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <View.Port />
    </Canvas>,
    document.body,
  );
}
