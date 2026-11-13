// The gear the DeviceArt component can draw, with the box each drawing
// lives in (viewBox width × height, in proportion to the real thing).
export const ART_BOX = {
  monitor: [280, 90],
  keyboard: [290, 100],
  mouse: [60, 120],
  "magic-mouse": [60, 120],
  mousepad: [490, 420],
  headset: [180, 200],
  case: [210, 450],
  laptop: [310, 230],
  cpu: [120, 120],
  gpu: [280, 118],
  motherboard: [244, 244],
  ram: [136, 68],
  cooler: [400, 130],
  ssd: [220, 60],
  psu: [150, 140],
} as const satisfies Record<string, readonly [number, number]>;

export type ArtKind = keyof typeof ART_BOX;

