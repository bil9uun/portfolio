import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import type { Finish } from "@/content/uses";
import { useDeskAnim } from "@/components/desk-3d/anim";
import { screenTexture, type ScreenKind } from "@/components/desk-3d/screens";
import {
  MOUSE,
  seam,
  shellGeometry,
  surfacePoint,
} from "@/components/desk-3d/ergo-mouse";

// Low-poly models of my gear, built from primitives at real size (cm).
// Each sits with its base on y = 0 and its front facing +z.

const FINISH: Record<
  Finish | "dark",
  { color: string; roughness: number; metalness: number }
> = {
  white: { color: "#ECEDE6", roughness: 0.45, metalness: 0.05 },
  silver: { color: "#C9CCD1", roughness: 0.3, metalness: 0.7 },
  gray: { color: "#5E6369", roughness: 0.5, metalness: 0.25 },
  black: { color: "#1D201C", roughness: 0.55, metalness: 0.15 },
  dark: { color: "#2A2D27", roughness: 0.6, metalness: 0.2 },
};

type Look = { finish?: Finish };

const Mat = ({ finish }: Look) => (
  <meshStandardMaterial {...FINISH[finish ?? "dark"]} />
);

// A lit screen showing `kind`.
const Screen = ({ kind, w, h }: { kind: ScreenKind; w: number; h: number }) => {
  const map = screenTexture(kind);
  return (
    <>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.55}
        roughness={0.55}
      />
    </>
  );
};

// A fan seen face on along its axis (+y by default).
const Fan = ({ r, h = 2.4 }: { r: number; h?: number }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[r, r, h, 28]} />
      <meshStandardMaterial color="#151714" roughness={0.8} />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => (
      <mesh
        key={i}
        rotation={[0, (i * Math.PI * 2) / 7, 0]}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[0.25, h * 0.6, r * 1.7]} />
        <meshStandardMaterial color="#C9CBC2" roughness={0.5} />
      </mesh>
    ))}
    <mesh>
      <cylinderGeometry args={[r * 0.3, r * 0.3, h + 0.1, 20]} />
      <meshStandardMaterial color="#ECEDE6" roughness={0.4} />
    </mesh>
  </group>
);

export const Monitor = ({
  finish,
  size: [w, h],
  screen = "code",
}: Look & { size: [number, number]; screen?: ScreenKind }) => {
  const lift = 12;
  return (
    <group>
      {/* Foot, neck, panel and the lit screen */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.6, -2]}
        scale={[1, 1, 0.75]}
      >
        <cylinderGeometry args={[11, 12, 1.2, 40]} />
        <Mat finish={finish} />
      </mesh>
      <mesh castShadow position={[0, (lift + h / 2) / 2 + 0.6, -4]}>
        <boxGeometry args={[5, lift + h / 2, 2.6]} />
        <Mat finish={finish} />
      </mesh>
      <mesh castShadow position={[0, lift + h / 2, -1.6]}>
        <boxGeometry args={[w, h, 1.8]} />
        <Mat finish={finish} />
      </mesh>
      <mesh position={[0, lift + h / 2, -0.69]}>
        <Screen kind={screen} w={w - 1.4} h={h - 1.4} />
      </mesh>
    </group>
  );
};

// A 60% layout, row by row, in key units.
const ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
];

export const Keyboard = ({
  finish,
  keys,
  lowProfile = false,
  w = 29,
  d = 10.4,
}: Look & { keys?: Finish; lowProfile?: boolean; w?: number; d?: number }) => {
  const bodyH = lowProfile ? 1.4 : 2.6;
  const keyH = lowProfile ? 0.5 : 1;
  const u = (w - 1.4) / 15;
  const rowD = (d - 1.2) / ROWS.length;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, bodyH / 2, 0]}>
        <boxGeometry args={[w, bodyH, d]} />
        <Mat finish={finish} />
      </mesh>
      {ROWS.flatMap((row, r) => {
        let x = -w / 2 + 0.7;
        return row.map((size, k) => {
          const cx = x + (size * u) / 2;
          x += size * u;
          return (
            <mesh
              key={`${r}-${k}`}
              castShadow
              position={[cx, bodyH + keyH / 2, -d / 2 + 0.6 + rowD * (r + 0.5)]}
            >
              <boxGeometry args={[size * u - 0.2, keyH, rowD - 0.2]} />
              <Mat finish={keys ?? finish} />
            </mesh>
          );
        });
      })}
    </group>
  );
};

// Apple Magic Mouse: a low, smooth, symmetric shell.
export const MagicMouse = ({ finish }: Look) => (
  <mesh castShadow position={[0, 1, 0]} scale={[2.85, 1.05, 5.7]}>
    <sphereGeometry args={[1, 40, 24]} />
    <Mat finish={finish} />
  </mesh>
);

// ATK Dragonfly Y9: an ergonomic right-handed shell with split buttons,
// a scroll wheel and two thumb buttons on the left.
export const ErgoMouse = ({ finish }: Look) => {
  const parts = useMemo(
    () => ({
      shell: shellGeometry(),
      split: seam([
        [0, -0.97],
        [0, -0.72],
        [0, -0.38],
        [0, -0.1],
      ]),
      buttonsEnd: seam([
        [-0.85, -0.12],
        [-0.4, -0.1],
        [0, -0.1],
        [0.4, -0.1],
        [0.85, -0.12],
      ]),
      wheel: surfacePoint(0, -0.55, -0.25),
    }),
    [],
  );
  const groove = "#8F948C";
  return (
    <group>
      <mesh castShadow receiveShadow geometry={parts.shell}>
        <Mat finish={finish} />
      </mesh>
      <mesh geometry={parts.split}>
        <meshStandardMaterial color={groove} />
      </mesh>
      <mesh geometry={parts.buttonsEnd}>
        <meshStandardMaterial color={groove} />
      </mesh>
      <mesh position={parts.wheel} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.62, 0.62, 0.55, 24]} />
        <meshStandardMaterial color="#3A3F37" roughness={0.8} />
      </mesh>
      {[-0.32, 0.02].map((zn) => {
        const at = surfacePoint(-0.97, zn);
        return (
          <mesh
            key={zn}
            position={[at.x - 0.08, MOUSE.BASE + 1.5, at.z]}
            rotation={[0, 0, 0.25]}
          >
            <boxGeometry args={[0.35, 0.55, 1.7]} />
            <meshStandardMaterial color="#D9DBD3" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Mousepad = ({ finish }: Look) => (
  <group>
    <mesh receiveShadow position={[0, 0.15, 0]}>
      <boxGeometry args={[49, 0.3, 42]} />
      <Mat finish={finish} />
    </mesh>
    {/* Stitched edge */}
    {(
      [
        [0, -20.6, 48, 0.4],
        [0, 20.6, 48, 0.4],
        [-24.1, 0, 0.4, 41.6],
        [24.1, 0, 0.4, 41.6],
      ] as const
    ).map(([x, z, w, d]) => (
      <mesh key={`${x}${z}`} position={[x, 0.32, z]}>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial color="#4A4F47" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

export const Headset = ({ finish }: Look) => (
  <group>
    {/* Lying flat: a half-circle band behind two ear cups */}
    <mesh castShadow position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[8.5, 1.1, 12, 40, Math.PI]} />
      <Mat finish={finish} />
    </mesh>
    {[-8.5, 8.5].map((x) => (
      <group key={x} position={[x, 1.8, 1.5]}>
        <mesh castShadow scale={[1, 1, 1.3]}>
          <cylinderGeometry args={[4.4, 4.4, 3.6, 32]} />
          <Mat finish={finish} />
        </mesh>
        <mesh position={[0, 1.85, 0]} scale={[1, 1, 1.3]}>
          <cylinderGeometry args={[3, 3, 0.2, 32]} />
          <meshStandardMaterial color="#A4A79E" roughness={0.9} />
        </mesh>
      </group>
    ))}
  </group>
);

export const Laptop = ({ finish }: Look) => (
  <group>
    <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
      <boxGeometry args={[31.3, 1.5, 22.1]} />
      <Mat finish={finish} />
    </mesh>
    {/* Keyboard well and trackpad */}
    <mesh position={[0, 1.51, -3.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[27, 11]} />
      <meshStandardMaterial color="#141614" roughness={0.7} />
    </mesh>
    <mesh position={[0, 1.51, 6.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[13, 8]} />
      <meshStandardMaterial color="#B7BBC1" roughness={0.25} metalness={0.6} />
    </mesh>
    {/* Lid, hinged at the back edge and open about 110° */}
    <group position={[0, 1.5, -11]} rotation={[(-110 * Math.PI) / 180, 0, 0]}>
      <mesh castShadow position={[0, 0.35, 11]}>
        <boxGeometry args={[31.3, 0.7, 22]} />
        <Mat finish={finish} />
      </mesh>
      <mesh position={[0, -0.01, 11]} rotation={[Math.PI / 2, 0, 0]}>
        <Screen kind="code" w={29.6} h={19.6} />
      </mesh>
    </group>
  </group>
);

// The case: a white shell that turns see-through in x-ray mode, with a
// glass side facing -x. Its insides are passed in as children.
export const Case = ({
  finish,
  children,
}: Look & { children?: React.ReactNode }) => {
  const anim = useDeskAnim();
  const shell = useRef<MeshStandardMaterial[]>([]);
  const glass = useRef<MeshStandardMaterial>(null);

  // The shell is always a transparent material, so only opacity changes
  // here (switching `transparent` at runtime would need a shader rebuild).
  useFrame(() => {
    const x = anim.current.xray;
    shell.current.forEach((m) => {
      m.opacity = 1 - x * 0.92;
      m.depthWrite = x < 0.05;
    });
    if (glass.current) glass.current.opacity = 0.22 - x * 0.16;
  });

  const W = 21;
  const H = 47;
  const D = 45;
  const panels: [number[], number[]][] = [
    [
      [W, 1, D],
      [0, 0.5, 0],
    ], // bottom
    [
      [W, 0.6, D],
      [0, H - 0.3, 0],
    ], // top mesh
    [
      [W, H, 0.6],
      [0, H / 2, -D / 2],
    ], // back
    [
      [W, H, 0.8],
      [0, H / 2, D / 2],
    ], // front mesh
    [
      [0.6, H, D],
      [W / 2, H / 2, 0],
    ], // solid side
  ];

  return (
    <group>
      {panels.map(([size, pos], i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={pos as [number, number, number]}
        >
          <boxGeometry args={size as [number, number, number]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) shell.current[i] = m;
            }}
            {...FINISH[finish ?? "dark"]}
            transparent
          />
        </mesh>
      ))}
      <mesh position={[-W / 2 + 0.2, H / 2, 0]}>
        <boxGeometry args={[0.4, H - 1.2, D - 1.2]} />
        <meshStandardMaterial
          ref={glass}
          color="#C8D4D0"
          transparent
          opacity={0.22}
          roughness={0.05}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
      {/* Three front intake fans, lit, behind the mesh */}
      {[9, 23, 37].map((y) => (
        <group
          key={y}
          position={[0, y, D / 2 - 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <Fan r={5.6} />
          <mesh>
            <torusGeometry args={[5.4, 0.25, 8, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#A57BFF"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  );
};

// —— Inside the PC (positions come from layout.ts, relative to the case) ——

export const Motherboard = ({ finish }: Look) => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[0.3, 24.4, 24.4]} />
      <Mat finish={finish} />
    </mesh>
    {/* VRM heatsinks, chipset, PCIe slots */}
    <mesh position={[-0.9, 9.5, -2]}>
      <boxGeometry args={[1.5, 3.5, 13]} />
      <meshStandardMaterial color="#B7BBC1" metalness={0.6} roughness={0.35} />
    </mesh>
    <mesh position={[-0.9, -6, 6]}>
      <boxGeometry args={[1.2, 4, 4]} />
      <meshStandardMaterial color="#B7BBC1" metalness={0.6} roughness={0.35} />
    </mesh>
    {[-4.5, -9.5].map((y) => (
      <mesh key={y} position={[-0.6, y, -1]}>
        <boxGeometry args={[0.9, 0.8, 18]} />
        <meshStandardMaterial color="#2A2D27" />
      </mesh>
    ))}
  </group>
);

// The AIO pump block on the CPU, with a lit ring.
export const Cpu = () => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh castShadow>
      <cylinderGeometry args={[3.6, 3.6, 2.4, 32]} />
      <meshStandardMaterial color="#ECEDE6" roughness={0.4} />
    </mesh>
    <mesh position={[0, -1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.6, 0.25, 8, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#2EC4D6"
        emissiveIntensity={1.4}
      />
    </mesh>
  </group>
);

export const Ram = ({ finish }: Look) => (
  <group>
    {[0, 1.2].map((z) => (
      <group key={z} position={[0, 0, z]}>
        <mesh castShadow>
          <boxGeometry args={[3.4, 13.3, 0.7]} />
          <Mat finish={finish} />
        </mesh>
        <mesh position={[-1.9, 0, 0]}>
          <boxGeometry args={[0.5, 13.3, 0.6]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#FF5CA8"
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>
    ))}
  </group>
);

export const Gpu = ({ finish }: Look) => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[11, 4, 27]} />
      <Mat finish={finish} />
    </mesh>
    {[-6.5, 6.5].map((z) => (
      <group key={z} position={[0, -2.05, z]}>
        <Fan r={4.4} h={0.3} />
      </group>
    ))}
  </group>
);

export const Cooler = ({ finish }: Look) => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[12, 2.7, 39.4]} />
      <Mat finish={finish} />
    </mesh>
    {[-12.4, 0, 12.4].map((z) => (
      <group key={z} position={[0, -2.7, z]}>
        <mesh>
          <boxGeometry args={[12, 2.5, 12]} />
          <Mat finish={finish} />
        </mesh>
        <group position={[0, -0.05, 0]}>
          <Fan r={5.6} h={2.6} />
        </group>
      </group>
    ))}
  </group>
);

export const Psu = () => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[14, 8.6, 15]} />
      <meshStandardMaterial color="#1D201C" roughness={0.6} />
    </mesh>
    {/* Fan grille on top */}
    {[2, 3.6, 5.2].map((r) => (
      <mesh key={r} position={[0, 4.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 0.15, r, 40]} />
        <meshStandardMaterial color="#4A4F47" />
      </mesh>
    ))}
    <mesh position={[0, 4.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.9, 24]} />
      <meshStandardMaterial color="#4A4F47" />
    </mesh>
  </group>
);

// The processor itself (on its own card): green substrate, metal lid.
export const CpuChip = () => (
  <group>
    <mesh castShadow position={[0, 0.06, 0]}>
      <boxGeometry args={[4, 0.12, 4]} />
      <meshStandardMaterial color="#2F5A36" roughness={0.6} />
    </mesh>
    <mesh castShadow position={[0, 0.32, 0]}>
      <boxGeometry args={[3.2, 0.4, 3.2]} />
      <meshStandardMaterial color="#C9CCD1" metalness={0.85} roughness={0.25} />
    </mesh>
    <mesh
      position={[-1.75, 0.13, 1.75]}
      rotation={[-Math.PI / 2, 0, Math.PI / 4]}
    >
      <circleGeometry args={[0.2, 3]} />
      <meshStandardMaterial color="#C9A44A" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

// M.2 drive: black board, a grey label and gold contacts at one end.
export const Ssd = () => (
  <group>
    <mesh>
      <boxGeometry args={[0.3, 2.2, 8]} />
      <meshStandardMaterial color="#151714" />
    </mesh>
    <mesh position={[-0.17, 0, 0.6]}>
      <boxGeometry args={[0.05, 1.7, 5.6]} />
      <meshStandardMaterial color="#5A5F57" roughness={0.6} />
    </mesh>
    <mesh position={[-0.17, 0, -3.65]}>
      <boxGeometry args={[0.05, 1.9, 0.6]} />
      <meshStandardMaterial color="#C9A44A" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);
