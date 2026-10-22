import { useNavigate } from 'react-router-dom';

/*
 * Navigation tokens shared by every page, matching the mockup's data-go values:
 *   home · jobs · job:<id> · apply[:<id>] · notice · faq · legal:terms|privacy · rooms
 * "rooms" goes home and scrolls to the rooms grid.
 */
export function pathFor(token: string): string {
  const [view, arg] = token.split(':');
  switch (view) {
    case 'home': return '/';
    case 'jobs': return '/jobs';
    case 'job': return `/jobs/${arg}`;
    case 'apply': return arg ? `/apply?job=${arg}` : '/apply';
    case 'notice': return '/notice';
    case 'faq': return '/faq';
    case 'legal': return arg === 'privacy' ? '/privacy' : '/terms';
    case 'rooms': return '/#rooms';
    default: return '/';
  }
}

export function useGo() {
  const navigate = useNavigate();
  return (token: string) => navigate(pathFor(token));
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const SPRING = { type: 'spring', duration: 0.5, bounce: 0.2 } as const;
