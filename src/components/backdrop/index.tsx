import { useEffect, useRef } from "react";
import { isParty } from "@/lib/party";
import { tilt } from "@/lib/tilt";
import { prefersReducedMotion } from "@/lib/gsap";

// A 3D version of the site's dotted design canvas: a field of points that
// recedes to the horizon and swells in slow waves.
// - Crests glow in the colour of the section you are reading.
// - The ground lifts and lights up under your pointer; a click sends a ripple.
// - The pointer tilts the camera; scrolling carries the field towards you.
// Plain WebGL, no 3D library: one draw call of points per frame.

const VERTEX = /* glsl */ `
attribute vec2 a_grid;
uniform float u_time;
uniform float u_scroll;
uniform float u_energy;
uniform vec2 u_mouse;
uniform vec3 u_pointer; // ground x, ground z, strength
uniform vec4 u_ripple;  // ground x, ground z, age (s), strength
uniform float u_aspect;
uniform float u_dpr;
varying float v_alpha;
varying float v_crest;
varying float v_glow;
varying float v_far;

const float WIDTH = 46.0;
const float DEPTH = 70.0;
const float NEAR = 1.5;
const float FOCAL = 1.6;

void main() {
  // Lay the grid out on the ground plane; scrolling slides it towards the camera
  // and wraps it, so the field never runs out.
  float x = (a_grid.x - 0.5) * WIDTH;
  float z = -NEAR - mod(a_grid.y * DEPTH - u_scroll, DEPTH);

  float t = u_time;
  float wave =
      sin(x * 0.32 + t * 0.55) * 0.45 +
      sin(z * 0.21 - t * 0.38) * 0.55 +
      sin((x + z) * 0.13 + t * 0.27) * 0.6;

  // The ground rises under the pointer and rings out from a click.
  float dp = distance(vec2(x, z), u_pointer.xy);
  float lift = exp(-dp * dp / 9.0) * u_pointer.z;
  float dr = distance(vec2(x, z), u_ripple.xy);
  float front = u_ripple.z * 9.0;
  float ring = u_ripple.w * exp(-u_ripple.z * 1.3) * exp(-(dr - front) * (dr - front) / 2.5);

  float y = -2.0 + wave * (0.75 + u_energy * 0.5) + lift * 0.9 + ring * 0.7;

  // Camera: eased towards the pointer for a little parallax.
  vec3 p = vec3(x - u_mouse.x * 1.4, y - u_mouse.y * 0.5, z);
  float pitch = 0.24 + u_mouse.y * 0.04;
  float c = cos(pitch), s = sin(pitch);
  p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);

  float depth = -p.z;
  // Landscape keeps the vertical view, portrait keeps the horizontal one,
  // so phones see the same field instead of a stretched, sparse one.
  vec2 lens = u_aspect >= 1.0
    ? vec2(FOCAL / u_aspect, FOCAL)
    : vec2(FOCAL * 1.4, FOCAL * 1.4 * u_aspect);
  gl_Position = vec4(p.x * lens.x, p.y * lens.y, 0.0, depth);

  v_crest = smoothstep(0.55, 1.35, wave);
  v_glow = clamp(lift + ring, 0.0, 1.0);
  float size = 3.6 * u_dpr * (FOCAL * 4.0 / depth) * (1.0 + v_crest * 0.5 + v_glow * 1.3);
  gl_PointSize = clamp(size, 0.0, 9.0 * u_dpr);

  // Fade out with distance, near the camera and at the sides.
  float fog = smoothstep(DEPTH + NEAR, DEPTH * 0.35, depth) * smoothstep(NEAR, NEAR + 1.5, depth);
  float side = 1.0 - smoothstep(WIDTH * 0.3, WIDTH * 0.5, abs(x));
  v_alpha = fog * side;
  v_far = smoothstep(DEPTH * 0.25, DEPTH * 0.9, depth);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 u_tint;
varying float v_alpha;
varying float v_crest;
varying float v_glow;
varying float v_far;
const vec3 BONE = vec3(0.925, 0.929, 0.902);

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  // A bright core with a soft halo around it.
  float core = 1.0 - smoothstep(0.015, 0.08, r);
  float halo = 1.0 - smoothstep(0.08, 0.25, r);
  float heat = clamp(v_crest + v_glow, 0.0, 1.0);
  vec3 color = mix(BONE, u_tint, heat);
  // Distance tints the field towards the section colour, like haze.
  color = mix(color, u_tint * 0.8, v_far * 0.55);
  float alpha = core * 0.85 + halo * 0.3 * (0.35 + heat);
  gl_FragColor = vec4(color, alpha * v_alpha * mix(0.45, 1.0, heat));
}
`;

// Each home-page section gives the field its own colour.
const SECTION_TINTS: [string, string][] = [
  ["home", "#22C55E"],
  ["expertise", "#2EC4D6"],
  ["work", "#4D8DFF"],
  ["experience", "#A57BFF"],
  ["play", "#FF5CA8"],
  ["contact", "#22C55E"],
];
const DEFAULT_TINT = "#22C55E";

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];

// Fully saturated colour for a hue in 0..1 (party mode cycles through them).
const hue = (h: number) =>
  [0, 2 / 3, 1 / 3].map((o) => 0.5 + 0.5 * Math.cos(2 * Math.PI * (h + o))) as [
    number,
    number,
    number,
  ];

const WIDTH = 46;
const FOCAL = 1.6;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

const Backdrop = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const aura = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const gl = el?.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!el || !gl) return; // no WebGL: the plain dark background stays

    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
    } catch {
      return;
    }
    gl.useProgram(program);

    // Fewer points on small screens.
    const small = window.matchMedia("(max-width: 768px)").matches;
    const cols = small ? 100 : 170;
    const rows = small ? 80 : 120;
    const grid = new Float32Array(cols * rows * 2);
    for (let j = 0, i = 0; j < rows; j++) {
      for (let k = 0; k < cols; k++) {
        grid[i++] = k / (cols - 1);
        grid[i++] = j / rows;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, "a_grid");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uTime = u("u_time");
    const uScroll = u("u_scroll");
    const uEnergy = u("u_energy");
    const uMouse = u("u_mouse");
    const uPointer = u("u_pointer");
    const uRipple = u("u_ripple");
    const uTint = u("u_tint");
    const uAspect = u("u_aspect");
    const uDpr = u("u_dpr");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive: overlapping points glow
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let aspect = 1;
    const resize = () => {
      el.width = Math.round(window.innerWidth * dpr);
      el.height = Math.round(window.innerHeight * dpr);
      aspect = el.width / el.height;
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform1f(uAspect, aspect);
      gl.uniform1f(uDpr, dpr);
    };
    resize();

    const pointer = { x: 0, y: 0, moved: -Infinity };
    const eased = {
      x: 0,
      y: 0,
      scroll: window.scrollY,
      velocity: 0,
      energy: 0,
      reach: 0, // strength of the lift under the pointer
      ground: { x: 0, z: -20 },
      tint: rgb(DEFAULT_TINT),
    };
    const ripple = { x: 0, z: 0, start: -Infinity };
    let lastY = window.scrollY;
    // The field follows scroll *speed*, capped, so a long jump (a nav click,
    // a flick of the wheel) glides at a steady pace instead of racing.
    const MAX_SPEED = 900; // px of page scroll per second

    // Where a screen point lands on the ground, undoing the vertex shader's
    // camera (ignoring the waves). Null above the horizon.
    const toGround = (sx: number, sy: number) => {
      const lens =
        aspect >= 1
          ? [FOCAL / aspect, FOCAL]
          : [FOCAL * 1.4, FOCAL * 1.4 * aspect];
      const pitch = 0.24 + eased.y * 0.04;
      const c = Math.cos(pitch);
      const s = Math.sin(pitch);
      // A camera-space ray (x, ry·D, −D), rotated back by the pitch.
      const ry = sy / lens[1];
      const k = ry * c - s; // camera-relative height gained per unit of depth
      if (k >= -0.01) return null; // at or above the horizon
      const depth = (-2 - eased.y * 0.5) / k; // where the ray meets y = −2
      const x = (sx * depth) / lens[0] + eased.x * 1.4;
      const z = depth * (-ry * s - c);
      return Math.abs(x) < WIDTH / 2 ? { x, z } : null;
    };

    const ndc = (e: PointerEvent) => ({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -((e.clientY / window.innerHeight) * 2 - 1),
    });
    const onMove = (e: PointerEvent) => {
      const p = ndc(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.moved = performance.now();
    };
    const onDown = (e: PointerEvent) => {
      const p = ndc(e);
      const hit = toGround(p.x, p.y);
      if (hit) Object.assign(ripple, { ...hit, start: performance.now() });
    };

    // Which section is in view, checked a few times a second.
    let sectionTint = rgb(DEFAULT_TINT);
    const pickTint = () => {
      let hex = DEFAULT_TINT;
      for (const [id, color] of SECTION_TINTS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top < window.innerHeight * 0.5) hex = color;
      }
      sectionTint = rgb(hex);
    };
    pickTint();
    const tintTimer = window.setInterval(pickTint, 250);

    const draw = (time: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScroll, eased.scroll * 0.012);
      gl.uniform1f(uEnergy, eased.energy);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.uniform3f(uPointer, eased.ground.x, eased.ground.z, eased.reach);
      const age = (performance.now() - ripple.start) / 1000;
      gl.uniform4f(uRipple, ripple.x, ripple.z, age, age < 4 ? 1 : 0);
      gl.uniform3f(uTint, ...eased.tint);
      gl.drawArrays(gl.POINTS, 0, cols * rows);
    };

    const paintAura = () => {
      const [r, g, b] = eased.tint.map((v) => Math.round(v * 255));
      if (aura.current)
        aura.current.style.background = `radial-gradient(ellipse 60% 55% at 50% 45%, rgba(${r}, ${g}, ${b}, 0.13), transparent 70%)`;
    };

    if (prefersReducedMotion()) {
      // One still frame, redrawn only when the window changes size.
      eased.tint = sectionTint;
      paintAura();
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => {
        clearInterval(tintTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const follow = 1 - Math.exp(-dt * 3);
      // On phones, tilting the device steers the camera instead.
      eased.x += ((tilt.active ? tilt.x : pointer.x) - eased.x) * follow;
      eased.y += ((tilt.active ? tilt.y : pointer.y) - eased.y) * follow;

      // Lift the ground under a moving pointer; let it settle when it rests.
      const hit = toGround(pointer.x, pointer.y);
      const active = hit && now - pointer.moved < 2500;
      if (hit) {
        const f = 1 - Math.exp(-dt * 8);
        eased.ground.x += (hit.x - eased.ground.x) * f;
        eased.ground.z += (hit.z - eased.ground.z) * f;
      }
      eased.reach += ((active ? 1 : 0) - eased.reach) * (1 - Math.exp(-dt * 3));

      const y = window.scrollY;
      const raw = (y - lastY) / Math.max(dt, 1e-3);
      lastY = y;
      const capped = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, raw));
      eased.velocity += (capped - eased.velocity) * (1 - Math.exp(-dt * 5));
      eased.scroll += eased.velocity * dt;
      // Scrolling swells the waves a little, never more than the cap allows.
      const party = isParty();
      const energy =
        (Math.abs(eased.velocity) / MAX_SPEED) * 0.6 + (party ? 0.8 : 0);
      eased.energy += (energy - eased.energy) * (1 - Math.exp(-dt * 2));

      // Drift towards the current section's colour.
      const tf = 1 - Math.exp(-dt * (party ? 6 : 2));
      const goal = party ? hue(now / 2500) : sectionTint;
      eased.tint = eased.tint.map(
        (v, i) => v + (goal[i] - v) * tf,
      ) as typeof eased.tint;
      paintAura();

      draw(now / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tintTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvas} className="size-full" />
      {/* Aura: a soft glow rising off the horizon, in the section's colour */}
      <div ref={aura} className="absolute inset-x-0 top-[28%] h-[50vh]" />
      {/* Keep the top of the screen quiet so text stays easy to read */}
      <div className="absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-ink via-ink/50 to-transparent" />
    </div>
  );
};

export default Backdrop;
