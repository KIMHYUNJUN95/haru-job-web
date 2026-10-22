import { useRef } from 'react';
import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { ArrowR } from './icons';
import { SPRING, prefersReducedMotion, useGo } from './nav';

type Props = { to: string; label: string; ariaLabel: string; dark?: boolean };

/* Slide-to-act: pointer capture, rubber-band past either end, flick velocity, spring return. Click or → also triggers it. */
export default function SlideToGo({ to, label, ariaLabel, dark }: Props) {
  const go = useGo();
  const root = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLButtonElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const st = useRef({ x0: 0, dx: 0, t0: 0, drag: false, moved: false, pid: -1, anim: null as AnimationPlaybackControls | null });

  const max = () => (root.current && knob.current ? root.current.clientWidth - knob.current.offsetWidth - 10 : 0);
  const paint = (v: number) => {
    if (!knob.current || !fill.current || !root.current) return;
    knob.current.style.transform = `translateX(${v}px)`;
    fill.current.style.transform = `scaleX(${Math.min(1, (v + 60) / root.current.clientWidth)})`;
  };
  const springTo = (target: number, after?: () => void) => {
    const s = st.current, from = s.dx;
    s.dx = target;
    s.anim?.stop();
    if (prefersReducedMotion()) { paint(target); after?.(); return; }
    s.anim = animate(from, target, { ...SPRING, onUpdate: paint, onComplete: after });
  };
  const done = () => springTo(max(), () => setTimeout(() => { go(to); st.current.dx = 0; paint(0); }, 120));

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = st.current;
    if (s.drag) return; // ignore a second finger
    s.drag = true; s.moved = false; s.pid = e.pointerId; s.x0 = e.clientX - s.dx; s.t0 = performance.now();
    s.anim?.stop();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is a nicety; dragging still works */ }
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag || e.pointerId !== s.pid) return;
    let v = e.clientX - s.x0; const m = max();
    if (v < 0) v *= 0.25; // friction instead of a wall
    else if (v > m) v = m + (v - m) * 0.25;
    if (Math.abs(v) > 4) s.moved = true;
    s.dx = v; paint(v);
  };
  const onEnd = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag || e.pointerId !== s.pid) return;
    s.drag = false;
    const velocity = s.dx / Math.max(1, performance.now() - s.t0); // px per ms
    if (s.dx > max() * 0.7 || (s.moved && velocity > 0.11 && s.dx > 24)) done(); else springTo(0);
  };

  return (
    <div className={`slide${dark ? ' dark' : ''}`} ref={root}>
      <span className="slide-fill" ref={fill} />
      <span className="slide-t">{label}</span>
      <button
        className="slide-k" type="button" aria-label={ariaLabel} ref={knob}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd}
        onClick={e => { if (st.current.moved) { e.preventDefault(); return; } done(); }}
        onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); done(); } }}
      >
        <ArrowR />
      </button>
    </div>
  );
}
