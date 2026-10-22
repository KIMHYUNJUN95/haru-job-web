import { hourDeg, minuteDeg, useJstHM } from './clock';

/** Live Tokyo analog clock (the menu tile). */
export default function AnalogClock() {
  const { h, m } = useJstHM();
  return (
    <div className="aclock" role="img" aria-label="신주쿠 현재 시각">
      <span className="h" style={{ transform: `rotate(${hourDeg(h, m)}deg)` }} />
      <span className="m" style={{ transform: `rotate(${minuteDeg(m)}deg)` }} />
      <span className="pin" />
      <span className="cap">Shinjuku</span>
    </div>
  );
}
