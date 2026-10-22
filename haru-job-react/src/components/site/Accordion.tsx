import { useState, type ReactNode } from 'react';
import { PlusIcon } from './icons';

type Props = {
  /** DOM id of the answer panel (aria-controls target). */
  id: string;
  q: ReactNode;
  a: ReactNode;
  /** Content rendered before the question inside the label (date, badges). */
  pre?: ReactNode;
  defaultOpen?: boolean;
};

/**
 * One accordion row (`.ai`). The answer opens with a CSS grid-rows 0fr → 1fr transition: one style
 * change per toggle, so the browser runs it without per-frame JS and it retargets smoothly when
 * clicked mid-way. Padding lives inside the clipped box, so nothing pops at the start or end.
 * Closed answers are `visibility: hidden` (after the transition), which keeps them out of the
 * tab order and the accessibility tree. Reduced motion skips the transition in CSS.
 */
export default function AccItem({ id, q, a, pre, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ai">
      <button className="aq" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span>{pre}{q}</span>
        <PlusIcon />
      </button>
      <div className="aa-wrap" data-open={open}>
        <div className="aa-clip">
          <p className="aa" id={id}>{a}</p>
        </div>
      </div>
    </div>
  );
}
