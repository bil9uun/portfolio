// Phone tilt as a pointer for the 3D background: -1..1 on each axis.
// Android sends orientation freely; iOS asks the visitor first, which
// needs a tap, so there it starts from the command palette.

type PermissionRequest = () => Promise<"granted" | "denied">;
const request = (
  window.DeviceOrientationEvent as unknown as
    | { requestPermission?: PermissionRequest }
    | undefined
)?.requestPermission;

export const tiltNeedsPermission = typeof request === "function";
export const tilt = { x: 0, y: 0, active: false };

const clamp = (v: number) => Math.max(-1, Math.min(1, v));
let base: number | null = null; // how the phone is usually held

const onOrientation = (e: DeviceOrientationEvent) => {
  if (e.beta === null || e.gamma === null) return;
  base = base === null ? e.beta : base + (e.beta - base) * 0.01;
  tilt.x = clamp(e.gamma / 25);
  tilt.y = clamp((base - e.beta) / 25);
  tilt.active = true;
};

export async function enableTilt() {
  if (request) {
    try {
      if ((await request()) !== "granted") return false;
    } catch {
      return false;
    }
  }
  window.addEventListener("deviceorientation", onOrientation);
  return true;
}

if (!tiltNeedsPermission && window.matchMedia("(pointer: coarse)").matches)
  void enableTilt();
