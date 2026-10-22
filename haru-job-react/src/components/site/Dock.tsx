import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'framer-motion';
import AnalogClock from './AnalogClock';
import SlideToGo from './SlideToGo';
import { EASE_OUT, SPRING, prefersReducedMotion, useGo } from './nav';

/* iOS-like sheet curve (Ionic) for enter/exit; a flick faster than this (px/ms) dismisses regardless of distance */
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
const FLICK = 0.11;

/* Phone dock (hidden ≥834px by CSS) plus the bottom sheet it opens. `page` drives the sliding indicator. */
export default function Dock({ page }: { page: string }) {
  const go = useGo();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const ind = useRef<HTMLSpanElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closing = useRef(false);
  const drag = useRef({ on: false, pid: -1, y0: 0, t0: 0, dy: 0, h: 0, moved: false });

  /* indicator follows the current page; first appearance fades in place instead of sliding */
  useLayoutEffect(() => {
    const el = ind.current, b = tabs.current[page];
    if (!el) return;
    if (!b) { el.style.opacity = '0'; return; }
    const was = el.style.opacity === '1';
    if (!was) el.style.transition = 'opacity 160ms ease';
    el.style.width = b.offsetWidth + 'px';
    el.style.transform = `translateX(${b.offsetLeft}px)`;
    el.style.opacity = '1';
    if (!was) requestAnimationFrame(() => { el.style.transition = ''; });
  }, [page]);

  /* slide the sheet out from wherever it is (including mid-drag) */
  const close = useCallback((immediate = false) => {
    const s = sheet.current, w = wrap.current;
    if (!open || closing.current) return;
    if (immediate || prefersReducedMotion() || !s || !w) { setOpen(false); return; }
    closing.current = true;
    const from = drag.current.dy;
    const to = s.offsetHeight;
    animate(s, { transform: [`translateY(${from}px)`, `translateY(${to}px)`] }, { duration: 0.28, ease: EASE_DRAWER });
    animate(w, { opacity: 0 }, { duration: 0.28, ease: EASE_DRAWER }).then(() => { closing.current = false; drag.current.dy = 0; setOpen(false); });
  }, [open]);

  useEffect(() => {
    const s = sheet.current, w = wrap.current;
    if (!open || !s || !w) return;
    drag.current.dy = 0;
    if (!prefersReducedMotion()) {
      animate(w, { opacity: [0, 1] }, { duration: 0.3, ease: EASE_OUT });
      animate(s, { transform: ['translateY(100%)', 'translateY(0%)'] }, { duration: 0.45, ease: EASE_DRAWER });
      animate(Array.from(s.querySelectorAll('[data-sheet-item]')) as HTMLElement[], { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.32, delay: stagger(0.03, { startDelay: 0.12 }), ease: EASE_OUT });
    }
    s.focus({ preventScroll: true });
    const root = document.documentElement, prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); root.style.overflow = prev; };
  }, [open, close]);

  useEffect(() => { if (!open) opener.current?.focus({ preventScroll: true }); }, [open]);

  /* grabber: drag down to dismiss, rubber-band upward, tap to close */
  const paint = (dy: number) => {
    const s = sheet.current, w = wrap.current, d = drag.current;
    if (!s || !w) return;
    s.style.transform = `translateY(${dy}px)`;
    w.style.opacity = String(1 - Math.max(0, Math.min(1, dy / (d.h || 1))) * 0.9);
  };
  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (d.on || closing.current || !sheet.current) return;
    Object.assign(d, { on: true, pid: e.pointerId, y0: e.clientY - d.dy, t0: performance.now(), h: sheet.current.offsetHeight, moved: false });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* still works without capture */ }
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.pid) return;
    let dy = e.clientY - d.y0;
    if (dy < 0) dy *= 0.2; // friction past the top instead of a wall
    if (Math.abs(dy) > 4) d.moved = true;
    d.dy = dy; paint(dy);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.pid) return;
    d.on = false;
    if (!d.moved) return; // a tap is handled by onClick
    const v = d.dy / Math.max(1, performance.now() - d.t0);
    if (d.dy > d.h * 0.25 || v > FLICK) { close(); return; }
    const s = sheet.current, w = wrap.current;
    if (!s || !w) return;
    const from = d.dy; d.dy = 0;
    animate(s, { transform: [`translateY(${from}px)`, 'translateY(0px)'] }, SPRING);
    animate(w, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT });
  };

  const nav = (token: string) => { close(true); go(token); };

  return (
    <>
      <nav className="dock" id="dock" aria-label="빠른 메뉴">
        <button className="dk dk-mark" type="button" ref={opener} aria-label="메뉴 열기" aria-expanded={open} onClick={() => setOpen(true)}>
          <svg className="dk-logo" aria-hidden="true"><use href="#sa-icon" /></svg>
        </button>
        <span className="dk-ind" ref={ind} aria-hidden="true" />
        <button className="dk" type="button" ref={el => { tabs.current.notice = el; }} aria-current={page === 'notice' ? 'page' : undefined} onClick={() => go('notice')}>공지사항</button>
        <button className="dk" type="button" ref={el => { tabs.current.faq = el; }} aria-current={page === 'faq' ? 'page' : undefined} onClick={() => go('faq')}>FAQ</button>
        <button className="dk dk-go" type="button" onClick={() => go('jobs')}>지원하기</button>
      </nav>

      {open && (
        <div className="panel-wrap sheet-wrap" ref={wrap} onClick={e => { if (e.target === wrap.current) close(); }}>
          <div className="panel sheet" role="dialog" aria-modal="true" aria-label="메뉴" ref={sheet} tabIndex={-1}>
            <button
              className="sheet-grab" type="button" aria-label="메뉴 닫기"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              onClick={() => { if (!drag.current.moved) close(); }}
            >
              <span className="panel-handle" aria-hidden="true" />
            </button>
            <button className="pt" type="button" data-sheet-item onClick={() => nav('jobs')}><b>채용공고</b><span>모집 중인 포지션 2개</span></button>
            <button className="pt" type="button" data-sheet-item onClick={() => nav('notice')}><b>공지사항</b><span>새로운 소식</span></button>
            <button className="pt pt-wide" type="button" data-sheet-item onClick={() => nav('rooms')}>
              <img src="/images/rooms/akebonobashi-b.jpg" alt="" />
              <span className="lbl"><b>객실 둘러보기</b><span className="play" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg></span></span>
            </button>
            <div className="sheet-slide" data-sheet-item><SlideToGo to="jobs" label="밀어서 지원하기" ariaLabel="지원하기" /></div>
            <button className="pt" type="button" data-sheet-item onClick={() => nav('faq')}><b>FAQ</b><span>자주 묻는 질문</span></button>
            <div className="pt pt-clock" data-sheet-item><AnalogClock /></div>
            <div className="panel-foot" data-sheet-item>
              <div className="lk">
                <button type="button" onClick={() => nav('legal:terms')}>이용약관</button>
                <button type="button" onClick={() => nav('legal:privacy')}>개인정보 처리방침</button>
                <a href="https://www.instagram.com/tokyo_stayari/" target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
