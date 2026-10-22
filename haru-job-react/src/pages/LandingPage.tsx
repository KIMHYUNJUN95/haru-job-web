import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Shell from '../components/site/Shell';
import SlideToGo from '../components/site/SlideToGo';
import { ArrowR } from '../components/site/icons';
import { prefersReducedMotion, useGo } from '../components/site/nav';
import { hourDeg, minuteDeg } from '../components/site/clock';

gsap.registerPlugin(ScrollTrigger);

const STATIONS: [station: string, buildings: string, walk: number][] = [
    ['아케보노바시역', 'Akebonobashi A · B', 3],
    ['히가시신주쿠역', 'Kabukicho · Shin-Okubo', 5],
    ['신오쿠보역', 'Kabukicho · Shin-Okubo', 8],
    ['세이부신주쿠역', 'Kabukicho · Shin-Okubo', 5],
    ['타카다노바바역', 'Takadanobaba', 10],
];

const ROOMS = [
    { name: 'Akebonobashi A', src: '/images/rooms/akebonobashi-a.jpg', shape: 'tall' },
    { name: 'Akebonobashi B', src: '/images/rooms/akebonobashi-b.jpg', shape: 'wide' },
    { name: 'Kabukicho', src: '/images/rooms/kabukicho.jpg', shape: 'tall' },
    { name: 'Shin-Okubo', src: '/images/rooms/shin-okubo.jpg', shape: 'wide' },
    { name: 'Shin-Okubo House A', src: '/images/rooms/shin-okubo-house-a.jpg', shape: 'wide' },
    { name: 'Shin-Okubo House B', src: '/images/rooms/shin-okubo-house-b.jpg', shape: 'tall' },
    { name: 'Shin-Okubo House C', src: '/images/rooms/shin-okubo-house-c.jpg', shape: 'tall' },
    { name: 'Takadanobaba', src: '/images/rooms/takadanobaba.jpg', shape: 'wide' },
];

const VALUES = [
    { img: '/images/rooms/akebonobashi-a.jpg', small: '디테일에 대한 긍지', title: 'Pride in Precision', text: '티끌 하나 없는 완벽한 공간을 완성하는 자부심. 우리가 준비한 섬세한 컨디션은 게스트의 감동이 됩니다.' },
    { img: '/images/takadanobaba_rooftop.jpg', small: '세계와 소통하는 접점', title: 'Global Standard', text: '도쿄를 찾는 수많은 이들의 가장 사적인 휴식 공간을 책임지며, 하이엔드 호스피탈리티를 체득합니다.' },
    { img: '/images/rooms/shin-okubo-house-c.jpg', small: '혁신적 업무 플랫폼', title: 'Smart & Flexible', text: '모바일에 최적화된 업무와 직관적인 매뉴얼. 비효율을 버리고 본질적인 가치 향상에 집중합니다.' },
    { img: '/images/rooms/shin-okubo-house-a.jpg', small: '체크아웃 10:00', title: 'A quiet reset', text: '게스트가 떠난 객실을 다음 게스트가 처음 여는 순간처럼 되돌립니다.' },
];

/* 오늘 방문자 수 (Firestore siteStats), 세션당 한 번만 센다 */
function useVisitCounter() {
    useEffect(() => {
        const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        if (sessionStorage.getItem('visited_today') === today) return;
        const ref = doc(db, 'siteStats', `visitors_${today}`);
        (async () => {
            try {
                const snap = await getDoc(ref);
                if (snap.exists()) await updateDoc(ref, { count: increment(1) });
                else await setDoc(ref, { count: 1, date: today });
                sessionStorage.setItem('visited_today', today);
            } catch (e) {
                console.error('Visitor tracking error:', e);
            }
        })();
    }, []);
}

const LandingPage = () => {
    const go = useGo();
    const location = useLocation();
    const root = useRef<HTMLDivElement>(null);
    const maniClock = useRef<HTMLDivElement>(null);
    const maniTime = useRef<HTMLSpanElement>(null);
    const gal = useRef<HTMLDivElement>(null);

    useVisitCounter();

    /* 10:00 → 16:00 as the statement scrolls by */
    const setMani = (p: number) => {
        const total = 600 + 360 * Math.max(0, Math.min(1, p));
        const h = Math.floor(total / 60), m = Math.floor(total % 60);
        const el = maniClock.current;
        if (!el) return;
        (el.querySelector('.h') as HTMLElement).style.transform = `rotate(${hourDeg(h, m)}deg)`;
        (el.querySelector('.m') as HTMLElement).style.transform = `rotate(${minuteDeg(m)}deg)`;
        if (maniTime.current) maniTime.current.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    useLayoutEffect(() => {
        setMani(0);
        if (prefersReducedMotion()) {
            const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setMani(1); }), { threshold: 0.4 });
            if (maniClock.current) io.observe(maniClock.current);
            return () => io.disconnect();
        }
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();
            mm.add('(min-width: 834px)', () => {
                const lines = gsap.utils.toArray<HTMLElement>('[data-ml]');
                gsap.set(lines, { opacity: 0.14 });
                const tl = gsap.timeline({ scrollTrigger: { trigger: '#mani', start: 'top top', end: '+=640', pin: true, scrub: 0.5, onUpdate: s => setMani(s.progress) } });
                lines.forEach((l, i) => tl.to(l, { opacity: 1, duration: 1 }, i * 1.1));
            });
            mm.add('(max-width: 833px)', () => {
                gsap.utils.toArray<HTMLElement>('[data-ml]').forEach(l => gsap.from(l, { opacity: 0.14, y: 20, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: l, start: 'top 80%', once: true } }));
                ScrollTrigger.create({ trigger: '#mani', start: 'top 70%', end: 'bottom 40%', scrub: true, onUpdate: s => setMani(s.progress) });
            });
            gsap.utils.toArray<HTMLElement>('[data-up]').forEach(el => gsap.from(el, { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
            gsap.utils.toArray<HTMLElement>('.wbar i b').forEach(el => gsap.from(el, { scaleX: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
            gsap.from('#gal .gc', { x: 40, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: '#gal', start: 'top 85%', once: true } });
            /* rooms: clip-path reveal from the bottom with a slow settle of the photo */
            gsap.utils.toArray<HTMLElement>('#rmGrid .rc').forEach((el, i) => {
                const img = el.querySelector('img');
                const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true }, delay: (i % 3) * 0.06 });
                tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut', clearProps: 'clipPath' })
                    .fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0);
            });
        }, root);
        return () => ctx.revert();
    }, []);

    /* "/#rooms" from the top bar, menu or hero row */
    useEffect(() => {
        if (location.hash !== '#rooms') return;
        /* no ScrollTrigger.refresh() here: it restores the scroll position and cancels the smooth scroll */
        const t = setTimeout(() => {
            const el = document.getElementById('rooms');
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }, 80);
        return () => clearTimeout(t);
    }, [location.hash, location.key]);

    /* gallery: mouse drag to scroll (touch keeps native scrolling) */
    useEffect(() => {
        const g = gal.current;
        if (!g) return;
        let down = false, sx = 0, sl = 0;
        const onDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = g.scrollLeft; g.classList.add('drag'); };
        const onMove = (e: PointerEvent) => { if (down) g.scrollLeft = sl - (e.clientX - sx); };
        const onUp = () => { if (!down) return; down = false; g.classList.remove('drag'); };
        g.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => { g.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    }, []);

    const row = (n: string, label: string, token: string) => (
        <button className="bp-it" type="button" onClick={() => go(token)}>
            <span><span className="n">{n}</span><span className="sl">/</span><b>{label}</b></span>
            <ArrowR size={16} className="bp-ar" />
        </button>
    );

    return (
        <Shell view="home">
            <div ref={root}>
                <div className="bhero">
                    <div className="bvid" aria-hidden="true">
                        <div className="bvid-in">
                            <img className="bvid-d" src="/media/hero.jpg" alt="" decoding="async" fetchPriority="high" />
                            <img className="bvid-m" src="/media/building.jpg" alt="" />
                        </div>
                        <div className="bvid-wash" />
                    </div>
                    <div className="bh-copy">
                        <h1 className="bh1">오래 머물고 싶은<br />방을 만듭니다.</h1>
                        <p className="bh-sub">신주쿠의 아파트먼트 호텔 STAY ARI에서 객실 클리닝 스태프와 정사원을 찾고 있어요. 처음이어도 괜찮아요.</p>
                        <button className="bbtn bbtn-l" type="button" onClick={() => go('jobs')}>지원하기</button>
                    </div>
                    <div className="bpanel-wrap">
                        <div className="bpanel">
                            <div className="bp-row">
                                <div><p className="bp-lab" lang="en">What do we do?</p><h2 className="bp-h">다음 게스트를 위한<br className="sm-br" /> 조용한 준비</h2></div>
                                <p className="bp-body">체크아웃 10:00부터 체크인 16:00까지, 객실과 린넨과 비품을 처음 문을 여는 순간처럼 되돌립니다. 신주쿠의 여덟 개 공간을 함께 가꿀 사람을 찾고 있어요.</p>
                            </div>
                            <div className="bp-div" />
                            <div className="bp-items">
                                {row('01', '객실 클리닝 스태프', 'job:cleaning-staff')}
                                {row('02', '사무직·현장직 정사원', 'job:full-time-staff')}
                                {row('03', '객실 둘러보기', 'rooms')}
                            </div>
                        </div>
                    </div>
                </div>

                <section className="mani gut" id="mani" aria-label="소개">
                    <div className="w mani-in">
                        <div>
                            <p className="mline" data-ml><span className="t">10:00</span> 누군가 떠나고,</p>
                            <p className="mline" data-ml><span className="t">16:00</span> 누군가 도착합니다.</p>
                            <p className="mline" data-ml>그 사이를 채울 사람을 찾고 있어요.</p>
                        </div>
                        <div className="aclock" ref={maniClock} role="img" aria-label="10시에서 16시로 가는 시계">
                            {[0, 90, 180, 270].map(d => <span key={d} className="tick" style={{ transform: `rotate(${d}deg)` }} />)}
                            <span className="h" /><span className="m" /><span className="pin" />
                            <span className="cap tnum" id="maniTime" ref={maniTime}>10:00</span>
                        </div>
                    </div>
                </section>

                <section className="sec2 gut" aria-labelledby="posH">
                    <div className="w">
                        <p className="lab">Open positions</p>
                        <h2 className="h2" id="posH">지금, 함께할 두 자리.</h2>
                        <div className="pos2">
                            <article className="pc pc-pt" data-up>
                                <span className="tag">아르바이트 · 10명</span>
                                <h3>객실 클리닝<br />스태프</h3>
                                <p className="pay tnum">시급 ¥1,350부터<small>연수 후 ¥1,500, 최대 ¥2,200</small></p>
                                <ul><li><span>근무 시간</span>09:45 ~ 17:45</li><li><span>근무일</span>주 2~5일, 하루 3~8시간</li><li><span>교통비</span>월 최대 ¥15,000</li><li><span>경력</span>처음이어도 괜찮아요</li></ul>
                                <div className="end"><button className="more2" type="button" onClick={() => go('job:cleaning-staff')}>공고 자세히 보기</button><SlideToGo to="apply:cleaning-staff" label="밀어서 지원하기" ariaLabel="객실 클리닝 스태프 지원하기" /></div>
                            </article>
                            <article className="pc pc-ft" data-up>
                                <span className="tag">정사원 · 5명</span>
                                <h3>사무직·현장직<br />정사원</h3>
                                <p className="pay tnum">월 ¥240,000부터<small>경력직 협의 · 연 1~2회 상여금</small></p>
                                <ul><li><span>직무</span>운영 · 브랜딩·마케팅 · 클리닝 매니저</li><li><span>근무</span>주 5일, 토·일·공휴일 휴무</li><li><span>비자</span>연수 후 비자 발급 지원</li><li><span>조건</span>일본어 N2 이상</li></ul>
                                <div className="end"><button className="more2" type="button" onClick={() => go('job:full-time-staff')}>공고 자세히 보기</button><SlideToGo dark to="apply:full-time-staff" label="밀어서 지원하기" ariaLabel="정사원 지원하기" /></div>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="sec2 gut" aria-labelledby="dayH">
                    <div className="w">
                        <p className="lab">Your day</p>
                        <h2 className="h2" id="dayH">조용하고 단단한 하루.</h2>
                        <div className="wg">
                            <div className="w1" data-up><h4>근무 시간</h4><p className="big tnum">09:45<br />— 17:45</p><p className="w1-note">하루 3~8시간 협의. 연장 근무는 1분 단위 수당.</p></div>
                            <div className="w1" data-up><h4>체크아웃 · 체크인</h4><p className="big tnum">10:00<br />→ 16:00</p><p className="w1-note">그 사이 객실과 린넨, 비품을 준비해요.</p></div>
                            <div className="w1 w2" data-up><h4>출근하는 역</h4>
                                <div>{STATIONS.map(([s, b, w]) => (
                                    <div className="srow" key={s}><span className="sn"><b>{s}</b><small>{b}</small></span><span className="tnum sw">도보 {w}분</span></div>
                                ))}</div>
                            </div>
                            <div className="w1 w2" data-up><h4>시급이 오르는 길</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                                    {([['시작', '61%', '¥1,350'], ['연수 1~3개월 후', '68%', '¥1,500'], ['능력에 따라 최대', '100%', '¥2,200']] as const).map(([l, w, v]) => (
                                        <div className="wbar" key={l}><span>{l}</span><i><b style={{ ['--w' as string]: w }} /></i><em className="tnum">{v}</em></div>
                                    ))}
                                </div>
                                <p className="w1-note">특정 지정일 근무 시 시급 +100~300엔.</p>
                            </div>
                            <div className="w1" data-up><h4>처음 40시간</h4><p className="big">매니저와<br />2인 1조</p><p className="w1-note">견습 기간 동안 함께 익혀요.</p></div>
                            <div className="w1" data-up><h4>연락</h4><p className="big">모든 연락은<br />카카오톡</p><p className="w1-note">결과는 보통 3일 안에 알려드려요.</p></div>
                        </div>
                    </div>
                </section>

                <section className="sec2" style={{ overflow: 'hidden' }} aria-labelledby="valH">
                    <div className="w w-gal gut"><p className="lab">How we work</p><h2 className="h2" id="valH">우리가 지키는 것들.</h2></div>
                    <div className="gal" id="gal" ref={gal}>
                        {VALUES.map(v => (
                            <article className="gc" key={v.title}><img src={v.img} alt="" loading="lazy" draggable={false} /><div className="gt"><small>{v.small}</small><b>{v.title}</b><p>{v.text}</p></div></article>
                        ))}
                    </div>
                </section>

                <section className="sec2 gut" id="rooms" aria-labelledby="roomH">
                    <div className="w">
                        <p className="lab">Our spaces</p>
                        <h2 className="h2" id="roomH">당신이 가꿀 여덟 개의 공간.</h2>
                        <p className="sub2">신주쿠에서 운영 중인 STAY ARI의 객실입니다.</p>
                        <div className="rm" id="rmGrid">
                            {ROOMS.map(r => (
                                <figure className={`rc ${r.shape}`} key={r.name}><img src={r.src} alt={`STAY ARI ${r.name} 객실`} loading="lazy" /><figcaption className="rl"><b>{r.name}</b></figcaption></figure>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="close gut" aria-labelledby="closeH">
                    <img className="close-art" src="/media/building.jpg" alt="" aria-hidden="true" />
                    <div className="w" style={{ position: 'relative' }}>
                        <p className="lab">Join us</p>
                        <h2 id="closeH">다음 체크인에서<br />만나요.</h2>
                        <p data-up>우리는 단순한 숙박을 넘어 여행자의 삶에 영감을 주는 공간을 만듭니다. 당신의 열정으로 특별한 공간을 완성해주세요.</p>
                        <SlideToGo to="jobs" label="밀어서 채용공고 보기" ariaLabel="채용공고 보기" />
                    </div>
                </section>
            </div>
        </Shell>
    );
};

export default LandingPage;
