import { useEffect, useRef, useState } from "react";
import { ui, useT } from "@/lib/i18n";
import { blip, click, panFor } from "@/lib/sound";
import { chatOpen, isTyping, paletteOpen, useStore } from "@/lib/store";
import { swarm } from "@/lib/swarm";

const SHOW_FOR = 4000; // ms a sent message stays up

// Figma-style cursor chat: press "/", type, Enter. The message rides on
// your pointer for a few seconds and the swarm gathers round to read it.
const CursorChat = () => {
  const tr = useT();
  const open = useStore(chatOpen);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pointer = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Follow the pointer without re-rendering.
  useEffect(() => {
    const place = () => {
      const { x, y } = pointer.current;
      if (bubble.current)
        bubble.current.style.transform = `translate3d(${x + 14}px, ${y + 18}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      place();
    };
    place();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || isTyping(e.target) || paletteOpen.get()) return;
      e.preventDefault();
      chatOpen.set(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // While a message is up, the swarm circles it.
  useEffect(() => {
    const el = bubble.current;
    if (!message || !el) return;
    swarm.focus = el;
    const gather = setTimeout(() => (swarm.focus = null), 1800);
    const clear = setTimeout(() => setMessage(null), SHOW_FOR);
    return () => {
      clearTimeout(gather);
      clearTimeout(clear);
      if (swarm.focus === el) swarm.focus = null;
    };
  }, [message]);

  const close = () => {
    chatOpen.set(false);
    setText("");
  };

  const send = () => {
    const value = text.trim();
    if (value) {
      setMessage(value);
      blip({ size: 0.2, pan: panFor(pointer.current.x) });
    }
    close();
  };

  if (!open && !message) return null;

  return (
    <div
      ref={bubble}
      className="pointer-events-none fixed left-0 top-0 z-[62] will-change-transform"
    >
      <div className="max-w-[min(20rem,70vw)] rounded-2xl rounded-tl-sm bg-signal px-3 py-2 text-sm font-medium text-ink shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
        {open ? (
          <input
            ref={input}
            value={text}
            maxLength={80}
            placeholder={tr(ui.chatPlaceholder)}
            aria-label={tr(ui.chat)}
            onChange={(e) => {
              setText(e.target.value);
              click({ pitch: 0.9 + Math.random() * 0.3, gain: 0.03 });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
              if (e.key === "Escape") close();
            }}
            onBlur={close}
            style={{ width: `${Math.max(12, text.length + 1)}ch` }}
            className="pointer-events-auto max-w-full bg-transparent outline-none placeholder:text-ink/55"
          />
        ) : (
          <p className="break-words">{message}</p>
        )}
      </div>
    </div>
  );
};

export default CursorChat;
