import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

// A 3D version of the site's dotted design canvas: a field of points that
// recedes to the horizon and swells in slow waves. Crests glow signal green,
// the pointer tilts the camera, and scrolling carries the field towards you.
// Plain WebGL, no 3D library: one draw call of points per frame.

const VERTEX = /* glsl */ `
attribute vec2 a_grid;
uniform float u_time;
uniform float u_scroll;
uniform float u_energy;
uniform vec2 u_mouse;
uniform float u_aspect;
uniform float u_dpr;
varying float v_alpha;
varying float v_crest;

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
  float y = -2.0 + wave * (0.75 + u_energy * 0.5);

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
  gl_PointSize = clamp(3.4 * u_dpr * (FOCAL * 4.0 / depth), 0.0, 5.5 * u_dpr);

  // Fade out with distance, near the camera and at the sides.
  float fog = smoothstep(DEPTH + NEAR, DEPTH * 0.35, depth) * smoothstep(NEAR, NEAR + 1.5, depth);
  float side = 1.0 - smoothstep(WIDTH * 0.3, WIDTH * 0.5, abs(x));
  v_alpha = fog * side;
  v_crest = smoothstep(0.55, 1.35, wave);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
varying float v_alpha;
varying float v_crest;
const vec3 BONE = vec3(0.925, 0.929, 0.902);
const vec3 SIGNAL = vec3(0.133, 0.773, 0.369);

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float soft = 1.0 - smoothstep(0.12, 0.25, r);
  vec3 color = mix(BONE, SIGNAL, v_crest);
  gl_FragColor = vec4(color, soft * v_alpha * mix(0.4, 1.0, v_crest));
}
`;

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
    const uAspect = u("u_aspect");
    const uDpr = u("u_dpr");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive: overlapping points glow
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      el.width = Math.round(window.innerWidth * dpr);
      el.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform1f(uAspect, el.width / el.height);
      gl.uniform1f(uDpr, dpr);
    };
    resize();

    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0, scroll: window.scrollY, energy: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const draw = (time: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScroll, eased.scroll * 0.012);
      gl.uniform1f(uEnergy, eased.energy);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.drawArrays(gl.POINTS, 0, cols * rows);
    };

    if (prefersReducedMotion()) {
      // One still frame, redrawn only when the window changes size.
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const follow = 1 - Math.exp(-dt * 3);
      eased.x += (pointer.x - eased.x) * follow;
      eased.y += (pointer.y - eased.y) * follow;
      const lastScroll = eased.scroll;
      eased.scroll += (window.scrollY - eased.scroll) * (1 - Math.exp(-dt * 4));
      // Fast scrolling swells the waves for a moment.
      const speed = Math.abs(eased.scroll - lastScroll) / Math.max(dt, 1e-3);
      eased.energy +=
        (Math.min(speed / 2500, 1) - eased.energy) * (1 - Math.exp(-dt * 2));
      draw(now / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvas} className="size-full" />
      {/* Aura: a soft green glow rising off the horizon */}
      <div className="absolute inset-x-0 top-[28%] h-[50vh] bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(34,197,94,0.12),transparent_70%)]" />
      {/* Keep the top of the screen quiet so text stays easy to read */}
      <div className="absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-ink via-ink/50 to-transparent" />
    </div>
  );
};

export default Backdrop;
