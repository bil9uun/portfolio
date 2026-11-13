import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { Box3, BoxGeometry, EdgesGeometry, Group, Vector3 } from "three";
import { useGroups, type UseItem } from "@/content/uses";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import {
  AnimContext,
  useDeskAnim,
  type DeskAnim,
} from "@/components/desk-3d/anim";
import {
  CASE,
  DESK_TOP,
  PC_PARTS,
  type Desk,
  type Placed,
  type TourStep,
  type Vec3,
} from "@/components/desk-3d/layout";
import {
  Case,
  Cooler,
  Cpu,
  Gpu,
  Headset,
  Keyboard,
  Laptop,
  Monitor,
  Motherboard,
  MagicMouse,
  ErgoMouse,
  Mousepad,
  Psu,
  Ram,
  Ssd,
} from "@/components/desk-3d/models";

const SIGNAL = "#22C55E";

// The bits of drei's OrbitControls the camera rig drives.
type Controls = { target: Vector3; update: () => void };

const items = new Map(
  useGroups.flatMap((g) => g.items).map((item) => [item.name, item]),
);
const itemFor = (name: string) => items.get(name) as UseItem;

function Model({ placed }: { placed: Placed }) {
  const item = itemFor(placed.name);
  const finish = item?.color;
  switch (placed.model) {
    case "monitor":
      return (
        <Monitor
          finish={finish}
          size={placed.size ?? [56, 33]}
          screen={
            placed.name === "ASUS ROG Strix XG259QNSR-W" ? "site" : "code"
          }
        />
      );
    case "keyboard":
      return placed.name === "NuPhy Air60 V2" ? (
        <Keyboard finish={finish} lowProfile w={29.3} d={11.2} />
      ) : (
        <Keyboard finish={finish} />
      );
    case "mouse":
      return <ErgoMouse finish={finish} />;
    case "magic-mouse":
      return <MagicMouse finish={finish} />;
    case "mousepad":
      return <Mousepad finish={finish} />;
    case "headset":
      return <Headset finish={finish} />;
    case "laptop":
      return <Laptop finish={finish} />;
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
    case "case":
      return null; // drawn by <Piece> itself, around the parts
  }
}

type PieceProps = {
  placed: Placed;
  /** A part inside the PC: it only explodes, and only picks, in x-ray. */
  inside?: boolean;
  selected: string | null;
  hovered: string | null;
  onSelect: (name: string) => void;
  onHover: (name: string | null) => void;
  children?: React.ReactNode;
};

// One item on the desk: moves out with the explode slider, and shows a
// Figma-style selection box with its name when hovered or picked.
function Piece({
  placed,
  inside = false,
  selected,
  hovered,
  onSelect,
  onHover,
  children,
}: PieceProps) {
  const tr = useT();
  const anim = useDeskAnim();
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const [box, setBox] = useState<{ size: Vec3; center: Vec3 } | null>(null);
  const item = itemFor(placed.name);

  // Measure the model once, in its own space, for the selection box.
  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;
    g.updateWorldMatrix(true, true);
    const b = new Box3().setFromObject(g);
    b.applyMatrix4(g.matrixWorld.clone().invert());
    const size = b.getSize(new Vector3());
    const center = b.getCenter(new Vector3());
    setBox({
      size: [size.x + 2, size.y + 2, size.z + 2],
      center: [center.x, center.y, center.z],
    });
  }, []);

  useFrame(() => {
    const k = anim.current.explode * (inside ? anim.current.xray : 1);
    outer.current?.position.set(
      placed.at[0] + placed.explode[0] * k,
      placed.at[1] + placed.explode[1] * k,
      placed.at[2] + placed.explode[2] * k,
    );
  });

  const edges = useMemo(
    () => (box ? new EdgesGeometry(new BoxGeometry(...box.size)) : null),
    [box],
  );
  const active = selected === placed.name || hovered === placed.name;
  // Inside parts can only be picked once the case is see-through.
  const live = () => !inside || anim.current.xray > 0.5;

  return (
    <group ref={outer} position={placed.at} rotation={[0, placed.turn ?? 0, 0]}>
      <group
        ref={inner}
        onPointerOver={(e) => {
          if (!live()) return;
          e.stopPropagation();
          onHover(placed.name);
        }}
        onPointerOut={(e) => {
          if (!live()) return;
          e.stopPropagation();
          onHover(null);
        }}
        onClick={(e) => {
          if (!live()) return;
          e.stopPropagation();
          onSelect(placed.name);
        }}
      >
        {placed.model === "case" ? (
          <Case finish={item?.color}>{children}</Case>
        ) : (
          <Model placed={placed} />
        )}
      </group>
      {active && box && edges && (
        <group position={box.center}>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={SIGNAL} />
          </lineSegments>
          <Html
            position={[0, box.size[1] / 2 + 1.5, 0]}
            center
            zIndexRange={[40, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="whitespace-nowrap rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] font-medium text-ink">
              {item ? tr(item.kind) : placed.name}
            </span>
          </Html>
        </group>
      )}
    </group>
  );
}

function DeskFurniture() {
  return (
    <group>
      <mesh receiveShadow castShadow position={[0, DESK_TOP - 1.5, 0]}>
        <boxGeometry args={[160, 3, 80]} />
        <meshStandardMaterial color="#2B2E28" roughness={0.85} />
      </mesh>
      {[
        [-74, -34],
        [74, -34],
        [-74, 34],
        [74, 34],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} castShadow position={[x, (DESK_TOP - 3) / 2, z]}>
          <boxGeometry args={[4, DESK_TOP - 3, 4]} />
          <meshStandardMaterial color="#1D201C" roughness={0.7} />
        </mesh>
      ))}
      <gridHelper args={[600, 60, "#272B25", "#1B1E19"]} />
    </group>
  );
}

// Eases the animated values towards their targets every frame.
function Animator() {
  const anim = useDeskAnim();
  useFrame((_, dt) => {
    const a = anim.current;
    const f = 1 - Math.exp(-dt * 5);
    a.explode += (a.explodeTarget - a.explode) * f;
    a.xray += (a.xrayTarget - a.xray) * f;
  });
  return null;
}

// Flies the camera to each tour step.
function CameraRig({ step }: { step: TourStep }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as Controls | null;
  useEffect(() => {
    if (!controls) return;
    const duration = prefersReducedMotion() ? 0 : 1.4;
    const tl = gsap.timeline({ defaults: { duration, ease: "power3.inOut" } });
    tl.to(camera.position, {
      x: step.camera[0],
      y: step.camera[1],
      z: step.camera[2],
    }).to(
      controls.target,
      {
        x: step.target[0],
        y: step.target[1],
        z: step.target[2],
        onUpdate: () => controls.update(),
      },
      0,
    );
    return () => void tl.kill();
  }, [step, camera, controls]);
  return null;
}

type SceneProps = {
  desk: Desk;
  step: TourStep;
  anim: { current: DeskAnim };
  selected: string | null;
  onSelect: (name: string | null) => void;
  /** Let the visitor orbit (mouse only: on touch it would trap scrolling). */
  orbit: boolean;
  /** Render only while on screen. */
  running: boolean;
};

const DeskScene = ({
  desk,
  step,
  anim,
  selected,
  onSelect,
  orbit,
  running,
}: SceneProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const first = desk.tour[0];

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => void (document.body.style.cursor = "");
  }, [hovered]);

  const common = { selected, hovered, onSelect, onHover: setHovered };

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={running ? "always" : "never"}
      camera={{ position: first.camera, fov: 35, near: 1, far: 3000 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
    >
      <AnimContext.Provider value={anim}>
        <hemisphereLight args={["#ECEDE6", "#1A1C19", 0.9]} />
        <directionalLight
          castShadow
          position={[80, 230, 130]}
          intensity={2.2}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-130}
          shadow-camera-right={130}
          shadow-camera-top={130}
          shadow-camera-bottom={-130}
          shadow-camera-near={10}
          shadow-camera-far={600}
        />
        <directionalLight
          position={[-160, 120, -120]}
          intensity={0.6}
          color="#2EC4D6"
        />

        <DeskFurniture />
        {desk.items.map((placed) => (
          <Piece key={placed.name} placed={placed} {...common}>
            {placed.name === CASE &&
              PC_PARTS.map((part) => (
                <Piece key={part.name} placed={part} inside {...common} />
              ))}
          </Piece>
        ))}
        <ContactShadows
          position={[0, 0.1, 0]}
          scale={300}
          blur={2.5}
          opacity={0.6}
          far={80}
        />

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableRotate={orbit}
          minPolarAngle={0.35}
          maxPolarAngle={1.42}
          target={first.target}
        />
        <CameraRig step={step} />
        <Animator />
      </AnimContext.Provider>
    </Canvas>
  );
};

export default DeskScene;
