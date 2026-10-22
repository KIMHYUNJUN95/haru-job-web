import { useEffect, useState } from 'react';
import { useGo } from './nav';

/* Top bar: logo | links | CTA. Transparent over the hero, glass once the page scrolls. */
export default function Header() {
  const go = useGo();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const upd = () => setScrolled(window.scrollY > 8);
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    return () => window.removeEventListener('scroll', upd);
  }, []);

  return (
    <div className={`tb gut${scrolled ? ' scrolled' : ''}`}>
      <button className="tb-brand" type="button" onClick={() => go('home')} aria-label="Stay Ari Tokyo 채용 홈">
        <svg className="tb-logo" aria-hidden="true"><use href="#sa-logo" /></svg>
      </button>
      <nav className="tb-links" aria-label="주요 메뉴">
        <button type="button" onClick={() => go('jobs')}>채용공고</button>
        <button type="button" onClick={() => go('rooms')}>객실</button>
        <button type="button" onClick={() => go('notice')}>공지사항</button>
        <button type="button" onClick={() => go('faq')}>FAQ</button>
      </nav>
      <button className="bbtn tb-cta" type="button" onClick={() => go('jobs')}>지원하기</button>
    </div>
  );
}
