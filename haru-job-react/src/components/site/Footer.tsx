import { useJst } from './clock';
import { useGo } from './nav';

export default function Footer() {
  const go = useGo();
  const clock = useJst(true);
  return (
    <footer className="foot gut" id="foot">
      <div className="w">
        <p lang="en">STAY ARI TOKYO operates apartment hotels in Shinjuku, Tokyo. Only applicants who pass document screening will be contacted individually via KakaoTalk.</p>
        <div className="fcols" lang="en">
          <div><p className="fh">Careers</p><button type="button" onClick={() => go('jobs')}>Open Positions</button><button type="button" onClick={() => go('job:cleaning-staff')}>Room Cleaning Staff</button><button type="button" onClick={() => go('job:full-time-staff')}>Full-time Staff</button></div>
          <div><p className="fh">Information</p><button type="button" onClick={() => go('notice')}>Notice</button><button type="button" onClick={() => go('faq')}>FAQ</button><a href="https://haru-stay.com/ko" target="_blank" rel="noopener noreferrer">Company</a></div>
          <div><p className="fh">Legal</p><button type="button" onClick={() => go('legal:terms')}>Terms of Use</button><button type="button" onClick={() => go('legal:privacy')}>Privacy Policy</button></div>
          <div><p className="fh">Follow</p><a href="https://www.instagram.com/tokyo_stayari/" target="_blank" rel="noopener noreferrer">Instagram @tokyo_stayari</a><span className="live tnum" style={{ marginTop: 6 }}><span className="dot" aria-hidden="true" />Tokyo {clock} JST</span></div>
        </div>
        <div lang="en" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span>Copyright © STAY ARI TOKYO. All rights reserved.</span><span>2-10 Sumiyoshicho, Shinjuku-ku, Tokyo 162-0065, Japan</span></div>
        <svg className="foot-mark" aria-hidden="true"><use href="#sa-logo" /></svg>
      </div>
    </footer>
  );
}
