import { useEffect, useState } from 'react';

/** Current Tokyo time as "HH:MM" or "HH:MM:SS". */
export function jst(withSeconds = false) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}), hour12: false,
  }).format(new Date());
}

export function useJst(withSeconds = false) {
  const [t, setT] = useState(() => jst(withSeconds));
  useEffect(() => {
    const id = setInterval(() => setT(jst(withSeconds)), withSeconds ? 1000 : 15000);
    return () => clearInterval(id);
  }, [withSeconds]);
  return t;
}

/** Tokyo hour/minute as numbers, refreshed every 15s. */
export function useJstHM() {
  const read = () => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    return { h: +(p.find(x => x.type === 'hour')?.value ?? 0) % 24, m: +(p.find(x => x.type === 'minute')?.value ?? 0) };
  };
  const [hm, setHm] = useState(read);
  useEffect(() => { const id = setInterval(() => setHm(read()), 15000); return () => clearInterval(id); }, []);
  return hm;
}

export const hourDeg = (h: number, m: number) => (h % 12) * 30 + m * 0.5;
export const minuteDeg = (m: number) => m * 6;
