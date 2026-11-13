import { CatmullRomCurve3, SphereGeometry, TubeGeometry, Vector3 } from "three";

// The ATK Dragonfly Y9's ergonomic shell, sculpted from a sphere: a hump
// towards the back, a right side that rises higher than the left, a
// narrower nose and a thumb groove on the left. Front is -z; cm.

const L = 12.6; // length
const W = 6.6; // width
const H = 3.5; // height of the shell above its base
const BASE = 0.35; // flat skirt under the shell

// Height multiplier along the length: peaks a little behind the middle.
const hump = (zn: number) => 0.62 + 0.38 * Math.exp(-((zn - 0.35) ** 2) / 0.28);
// Right side sits higher than the left, so the hand rests tilted.
const tilt = (xn: number) => 1 + 0.16 * xn;

/** x across the width for a point on the unit sphere. */
const across = (xn: number, zn: number) => {
  let k = 0.82 + (0.18 * (zn + 1)) / 2; // narrower at the nose
  if (xn < 0) k *= 1 - 0.1 * Math.exp(-((zn - 0.05) ** 2) / 0.12); // thumb
  return (xn * k * W) / 2;
};

/** Height of the top surface over (xn, zn), both in -1..1. */
export const topAt = (xn: number, zn: number) =>
  BASE +
  Math.sqrt(Math.max(0, 1 - xn * xn - zn * zn)) * hump(zn) * tilt(xn) * H;

export const surfacePoint = (xn: number, zn: number, lift = 0) =>
  new Vector3(across(xn, zn), topAt(xn, zn) + lift, (zn * L) / 2);

export function shellGeometry() {
  const g = new SphereGeometry(1, 72, 44);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    p.setXYZ(
      i,
      across(x, z),
      y >= 0 ? BASE + y * hump(z) * tilt(x) * H : BASE + y * BASE,
      (z * L) / 2,
    );
  }
  g.computeVertexNormals();
  return g;
}

/** A thin tube following the surface: the seams between the buttons. */
export function seam(points: [number, number][], radius = 0.05) {
  const curve = new CatmullRomCurve3(
    points.map(([xn, zn]) => surfacePoint(xn, zn, 0.01)),
  );
  return new TubeGeometry(curve, 48, radius, 6, false);
}

export const MOUSE = { L, W, H, BASE };
