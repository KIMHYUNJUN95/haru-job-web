import type { ReactNode } from 'react';
import { ChevL } from './icons';
import { useGo } from './nav';

type Props = { title: ReactNode; sub?: ReactNode; back?: [token: string, label: string]; children?: ReactNode };

/** Sub-page heading: optional back crumb, serif title, one-line subtitle. */
export default function PageHead({ title, sub, back, children }: Props) {
  const go = useGo();
  return (
    <div className="ph gut">
      <div className="w">
        {back && <button className="crumb" type="button" onClick={() => go(back[0])}><ChevL />{back[1]}</button>}
        <h1 className="h2" data-in>{title}</h1>
        {sub && <p className="sub2" data-in>{sub}</p>}
        {children}
      </div>
    </div>
  );
}
