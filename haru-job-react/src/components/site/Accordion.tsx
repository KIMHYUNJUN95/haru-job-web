import { useRef, useState, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import { PlusIcon } from './icons';
import { EASE_OUT, prefersReducedMotion } from './nav';

type Props = {
  /** DOM id of the answer panel (aria-controls target). */
  id: string;
  q: ReactNode;
  a: ReactNode;
  /** Content rendered before the question inside the label (date, badges). */
  pre?: ReactNode;
  defaultOpen?: boolean;
};

type Anim = { stop: () => void; then: (cb: () => void) => Promise<void> };

/**
 * One accordion row (`.ai`): a native button toggles the `.aa` panel with a height + opacity
 * animation (open 260ms, close 200ms). Reduced motion toggles instantly.
 * The panel's `hidden` attribute is driven imperatively so the close animation can finish first.
 */
export default function AccItem({ id, q, a, pre, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const box = useRef<HTMLParagraphElement>(null);
  const anim = useRef<Anim | null>(null);
  const initialHidden = useRef(!defaultOpen).current;

  const toggle = () => {
    const el = box.current;
    if (!el) return;
    const next = !open;
    setOpen(next);
    const running = anim.current;
    if (running) running.stop();
    anim.current = null;

    if (prefersReducedMotion()) {
      el.hidden = !next;
      el.style.height = '';
      el.style.opacity = '';
      return;
    }

    if (next) {
      const from = running ? el.offsetHeight : 0;
      el.hidden = false;
      el.style.height = '';
      const h = el.scrollHeight;
      const ctl = animate(el, { height: [from + 'px', h + 'px'], opacity: [running ? Number(getComputedStyle(el).opacity) : 0, 1] }, { duration: 0.26, ease: EASE_OUT }) as unknown as Anim;
      anim.current = ctl;
      ctl.then(() => {
        if (anim.current !== ctl) return;
        el.style.height = '';
        el.style.opacity = '';
        anim.current = null;
      });
    } else {
      const ctl = animate(el, { height: [el.offsetHeight + 'px', '0px'], opacity: [Number(getComputedStyle(el).opacity) || 1, 0] }, { duration: 0.2, ease: EASE_OUT }) as unknown as Anim;
      anim.current = ctl;
      ctl.then(() => {
        if (anim.current !== ctl) return;
        el.hidden = true;
        el.style.height = '';
        el.style.opacity = '';
        anim.current = null;
      });
    }
  };

  return (
    <div className="ai">
      <button className="aq" type="button" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span>{pre}{q}</span>
        <PlusIcon />
      </button>
      <p className="aa" id={id} ref={box} hidden={initialHidden}>{a}</p>
    </div>
  );
}
