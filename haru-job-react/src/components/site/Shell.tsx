import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import gsap from 'gsap';
import Dock from './Dock';
import Footer from './Footer';
import Header from './Header';
import { LogoDefs } from './LogoDefs';
import { EASE_OUT, prefersReducedMotion } from './nav';

type Props = {
  /** CSS view key: home · jobs · job · apply · notice · faq · legal */
  view: string;
  /** Dock indicator key (notice / faq), defaults to `view`. */
  dock?: string;
  /** false hides the top bar, dock and footer. */
  chrome?: boolean;
  className?: string;
  children: ReactNode;
};

/* Page frame shared by every route: logo symbols, top bar, dock + menu, footer, and the view entrance. */
export default function Shell({ view, dock, chrome = true, className, children }: Props) {
  const main = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    document.body.dataset.page = view;
    if (!location.hash) window.scrollTo(0, 0);
    const el = main.current;
    if (!el || prefersReducedMotion()) return;
    animate(el, { opacity: [0, 1] }, { duration: 0.22, ease: EASE_OUT });
    if (view === 'home') return;
    const items = el.querySelectorAll('[data-in]');
    if (!items.length) return;
    const tw = gsap.from(items, { y: 30, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', clearProps: 'all' });
    return () => { tw.revert(); };
  }, [view]);

  return (
    <>
      <LogoDefs />
      {chrome && <Header />}
      {chrome && <Dock page={dock ?? view} />}
      <main ref={main}>
        <section data-view={view} className={`on${className ? ' ' + className : ''}`}>{children}</section>
      </main>
      {chrome && <Footer />}
    </>
  );
}
