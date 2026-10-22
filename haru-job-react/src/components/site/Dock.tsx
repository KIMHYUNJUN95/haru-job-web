import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, stagger } from 'framer-motion';
import AnalogClock from './AnalogClock';
import SlideToGo from './SlideToGo';
import { XIcon } from './icons';
import { EASE_OUT, SPRING, prefersReducedMotion, useGo } from './nav';

/* Phone dock (hidden ≥834px by CSS) plus the tile menu it opens. `page` drives the sliding indicator. */
export default function Dock({ page }: { page: string }) {
  const go = useGo();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const ind = useRef<HTMLSpanElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closing = useRef(false);

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

  const close = useCallback((immediate = false) => {
    if (!open || closing.current) return;
    if (immediate || prefersReducedMotion() || !wrap.current || !panel.current) { setOpen(false); return; }
    closing.current = true;
    animate(panel.current, { transform: 'translateY(24px) scale(.97)', opacity: 0 }, { duration: 0.18, ease: EASE_OUT });
    animate(wrap.current, { opacity: 0 }, { duration: 0.18, ease: EASE_OUT }).then(() => { closing.current = false; setOpen(false); });
  }, [open]);

  useEffect(() => {
    if (!open || !wrap.current || !panel.current) return;
    if (!prefersReducedMotion()) {
      animate(wrap.current, { opacity: [0, 1] }, { duration: 0.2, ease: EASE_OUT });
      animate(panel.current, { transform: ['translateY(48px) scale(.94)', 'translateY(0px) scale(1)'], opacity: [0, 1] }, SPRING);
      animate(Array.from(panel.current.children) as HTMLElement[], { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.32, delay: stagger(0.03, { startDelay: 0.06 }), ease: EASE_OUT });
    }
    closer.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => { if (!open) opener.current?.focus({ preventScroll: true }); }, [open]);

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
        <div className="panel-wrap" ref={wrap} onClick={e => { if (e.target === wrap.current) close(); }}>
          <div className="panel" role="dialog" aria-modal="true" aria-label="메뉴" ref={panel}>
            <span className="panel-handle" aria-hidden="true" />
            <button className="pt" type="button" onClick={() => nav('jobs')}><b>채용공고</b><span>모집 중인 포지션 2개</span></button>
            <button className="pt" type="button" onClick={() => nav('notice')}><b>공지사항</b><span>새로운 소식</span></button>
            <button className="pt pt-wide" type="button" onClick={() => nav('rooms')}>
              <img src="/images/rooms/akebonobashi-b.jpg" alt="" />
              <span className="lbl"><b>객실 둘러보기</b><span className="play" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg></span></span>
            </button>
            <div style={{ gridColumn: '1/-1' }}><SlideToGo to="jobs" label="밀어서 지원하기" ariaLabel="지원하기" /></div>
            <button className="pt" type="button" onClick={() => nav('faq')}><b>FAQ</b><span>자주 묻는 질문</span></button>
            <div className="pt" style={{ padding: 10, background: 'transparent' }}><AnalogClock /></div>
            <div className="panel-foot">
              <div className="lk">
                <button type="button" onClick={() => nav('legal:terms')}>이용약관</button>
                <button type="button" onClick={() => nav('legal:privacy')}>개인정보</button>
                <a href="https://www.instagram.com/tokyo_stayari/" target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
              <button className="xbtn" type="button" ref={closer} aria-label="메뉴 닫기" onClick={() => close()}><XIcon /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
