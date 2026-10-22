import type { ReactNode } from 'react';
import Shell from './Shell';
import { useGo } from './nav';

type Props = { which: 'terms' | 'privacy'; children: ReactNode };

/** Shared legal view: serif title, revision date, segmented tab (terms ↔ privacy) and the `doc` article. */
export default function LegalLayout({ which, children }: Props) {
  const go = useGo();
  const isT = which === 'terms';
  return (
    <Shell view="legal">
      <div className="ph gut">
        <div className="w">
          <h1 className="h2" data-in>{isT ? '이용약관' : '개인정보 처리방침'}</h1>
          <p className="sub2" data-in>최종 수정일 2026년 3월 1일</p>
          <div className="seg" role="tablist" aria-label="약관 문서">
            <button type="button" role="tab" aria-selected={isT} onClick={() => !isT && go('legal:terms')}>이용약관</button>
            <button type="button" role="tab" aria-selected={!isT} onClick={() => isT && go('legal:privacy')}>개인정보 처리방침</button>
          </div>
        </div>
      </div>
      <div className="body gut">
        <div className="w">
          <article className="doc">{children}</article>
        </div>
      </div>
    </Shell>
  );
}
