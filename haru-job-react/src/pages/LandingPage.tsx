import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=90&auto=format', // 원본 히어로 1
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=90&auto=format', // 신주쿠 네온/번화가
    'https://images.unsplash.com/photo-1554797589-7241bb691973?w=1920&q=90&auto=format', // 야경 거리뷰
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=90&auto=format', // 도쿄 벚꽃과 사찰
    'https://images.unsplash.com/photo-1528696892704-5e1122852276?w=1920&q=90&auto=format', // 센소지 사찰 전통 느낌
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1920&q=90&auto=format'  // 벚꽃과 자연 길
];

const STREET = 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1920&q=90&auto=format';
const NIGHT = 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=1920&q=90&auto=format';

const rooms = [
    {
        src: '/images/arakicho_a.jpg',
        name: 'Arakicho A',
        link: '#',
        hoverImages: [
            '/images/arakicho_a.jpg',
            '/images/arakicho_a/1.jpg',
            '/images/arakicho_a/2.jpg',
            '/images/arakicho_a/3.jpg',
            '/images/arakicho_a/4.jpg'
        ]
    },
    {
        src: '/images/arakicho_b.jpg',
        name: 'Arakicho B',
        link: '#',
        hoverImages: [
            '/images/arakicho_b.jpg',
            '/images/arakicho_b/1.jpg',
            '/images/arakicho_b/2.jpg',
            '/images/arakicho_b/3.jpg',
            '/images/arakicho_b/4.jpg'
        ]
    },
    {
        src: '/images/kabukicho.jpg',
        name: 'Kabukicho',
        link: '#',
        hoverImages: [
            '/images/kabukicho.jpg',
            '/images/kabukicho/1.jpg',
            '/images/kabukicho/2.jpg',
            '/images/kabukicho/3.jpg',
            '/images/kabukicho/4.jpg'
        ]
    },
    {
        src: '/images/okubo_a.jpg',
        name: 'Okubo A',
        link: '#',
        hoverImages: [
            '/images/okubo_a.jpg',
            '/images/okubo_a/1.jpg',
            '/images/okubo_a/2.jpg',
            '/images/okubo_a/3.jpg',
            '/images/okubo_a/4.jpg'
        ]
    },
    {
        src: '/images/okubo_b.jpg',
        name: 'Okubo B',
        link: '#',
        hoverImages: [
            '/images/okubo_b.jpg',
            '/images/okubo_b/1.jpg',
            '/images/okubo_b/2.jpg',
            '/images/okubo_b/3.jpg',
            '/images/okubo_b/4.jpg'
        ]
    },
    {
        src: '/images/okubo_c.jpg',
        name: 'Okubo C',
        link: '#',
        hoverImages: [
            '/images/okubo_c.jpg',
            '/images/okubo_c/1.jpg',
            '/images/okubo_c/2.jpg',
            '/images/okubo_c/3.jpg',
            '/images/okubo_c/4.jpg'
        ]
    },
    {
        src: '/images/takadanobaba.jpg',
        name: 'Takadanobaba',
        link: '#',
        hoverImages: [
            '/images/takadanobaba.jpg',
            '/images/takadanobaba/1.jpg',
            '/images/takadanobaba/2.jpg',
            '/images/takadanobaba/3.jpg',
            '/images/takadanobaba/4.jpg'
        ]
    },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const heroRefs = useRef<(HTMLImageElement | null)[]>([]);
    const prevIndexRef = useRef(0);
    const textRef = useRef<HTMLDivElement>(null);
    const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);

    // Initial Scale Down Effect for first image
    useEffect(() => {
        if (heroRefs.current[0]) {
            gsap.to(heroRefs.current[0], {
                scale: 1,
                filter: 'blur(0px) brightness(1)',
                duration: 6,
                ease: 'power2.out',
                delay: 0.1
            });
        }
    }, []);

    // Fade Slideshow Effect Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5500); // 5.5초마다 사진 변경 (애니메이션 충분히 감상)
        return () => clearInterval(interval);
    }, []);

    // GSAP Reveal Animation (Premium Peel-off with Blur & Random Directions)
    useEffect(() => {
        const nextIndex = currentHeroIndex;
        const prevIndex = prevIndexRef.current;
        if (nextIndex === prevIndex) return;

        const currentImg = heroRefs.current[nextIndex];
        const prevImg = heroRefs.current[prevIndex];

        if (currentImg && prevImg) {

            // 🔥 다채로운 트랜지션을 위한 트랜지션 방향 배열 구축 (상, 하, 좌, 우, 대각선)
            const transitions = [
                { // 1. 아래에서 위로 (Bottom Up Wipe) - 기존
                    clipPathObj: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', y: -60 },
                    resetPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                },
                { // 2. 위에서 아래로 (Top Down Wipe)
                    clipPathObj: { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', y: 60 },
                    resetPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                },
                { // 3. 왼쪽에서 오른쪽으로 (Left to Right)
                    clipPathObj: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', x: 60 },
                    resetPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                },
                { // 4. 오른쪽에서 왼쪽으로 (Right to Left)
                    clipPathObj: { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', x: -60 },
                    resetPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                },
                { // 5. 중앙에서 바깥으로 쪼개지듯 (Center Split)
                    clipPathObj: { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', scale: 1.5 },
                    resetPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                }
            ];

            // 매 사진 변경 시마다 트랜지션 방식을 무작위 혹은 순차적으로 선택
            // 여기서는 nextIndex를 기반으로 순차적으로 다채롭게 적용
            const t = transitions[nextIndex % transitions.length];

            // 새 이미지 세팅 (스케일업 및 블러 상태에서 대기)
            gsap.set(currentImg, {
                zIndex: 1,
                clipPath: t.resetPath,
                scale: 1.2,
                filter: 'blur(10px) brightness(1.2)',
                y: 0,
                x: 0
            });

            gsap.set(prevImg, { zIndex: 2 }); // 이전 이미지는 덮개 역할

            const tl = gsap.timeline();

            // 1. Text Hide (살짝 가라앉음)
            if (textRef.current) {
                tl.to(textRef.current, {
                    opacity: 0,
                    y: 15,
                    duration: 0.5,
                    ease: 'power2.inOut'
                }, 0);
            }

            // 2. Image Reveal (이전 이미지가 선택된 t 모션대로 벗겨짐) & Filter (새 이미지 초점 맞춤)
            tl.to(prevImg, {
                ...t.clipPathObj, // 무작위/순차적으로 정해진 방향으로 깎임
                duration: 1.6,
                ease: 'power4.inOut'
            }, 0.2)
                .to(currentImg, {
                    scale: 1,
                    filter: 'blur(0px) brightness(1)',
                    duration: 6,
                    ease: 'power2.out'
                }, 0.2);

            // 3. Text Reveal (새로운 이미지 위로 떠오름)
            if (textRef.current) {
                tl.to(textRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                }, 1.2);
            }
        }

        prevIndexRef.current = nextIndex;
    }, [currentHeroIndex]);

    useEffect(() => {
        document.querySelectorAll('.anim').forEach((el) => {
            gsap.fromTo(el, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' },
            });
        });
    }, []);

    return (
        <div className="bg-white min-h-screen">

            {/* ─── Top Nav (numa 스타일: 좌 로고, 우 링크+버튼) ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Stay Ari</span>
                    <div className="flex items-center gap-6">
                        <span className="hidden md:inline text-[13px] text-[#888] font-medium">Shinjuku, Tokyo</span>
                        <button onClick={() => navigate('/apply')} className="btn-primary !text-[13px] !py-2.5 !px-6">
                            지원하기
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO — Animation Slideshow (GSAP Peel-off & Scale) ═══ */}
            <section className="relative w-full h-[92vh] overflow-hidden bg-black">
                {HERO_IMAGES.map((imgSrc, idx) => (
                    <img
                        key={idx}
                        ref={(el) => { heroRefs.current[idx] = el; }}
                        src={imgSrc}
                        alt="Shinjuku"
                        className="absolute inset-0 w-full h-full object-cover origin-center"
                        style={{
                            zIndex: idx === 0 ? 2 : 1,
                            clipPath: idx === 0 ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                            transform: idx === 0 ? 'scale(1)' : 'scale(1.15)'
                        }}
                        loading={idx === 0 ? "eager" : "lazy"}
                    />
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />

                <div ref={textRef} className="absolute bottom-10 left-6 md:left-12 text-white z-20">
                    <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight mb-4 drop-shadow-xl">
                        Join Stay Ari<br />in Shinjuku
                    </h1>
                    <p className="text-sm md:text-lg font-medium opacity-90 max-w-md leading-relaxed drop-shadow-md">
                        도쿄 신주쿠 최고의 숙박 경험을 함께 만들어갈 팀원을 모집합니다.
                    </p>
                </div>
            </section>

            {/* ═══ 3 Feature Cards (numa 스타일: 아이콘 + 짧은 제목 + 설명) ═══ */}
            <section className="anim py-20 md:py-28 px-6 md:px-10 max-w-[1400px] mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: '✦', title: '세심한 관리', desc: '객실 하나하나에 정성을 담아, 게스트가 머무는 순간마다 감동을 드립니다.' },
                        { icon: '◎', title: '글로벌 환대', desc: '전 세계에서 오는 여행자들에게 따뜻한 미소와 프로페셔널한 서비스를 제공합니다.' },
                        { icon: '◇', title: '디지털 운영', desc: '스마트 체크인부터 실시간 커뮤니케이션까지, 효율적인 디지털 시스템으로 운영합니다.' },
                    ].map((f, i) => (
                        <div key={i} className="bg-[#f7f7f5] rounded-3xl p-8 md:p-10 hover:bg-[#f0efed] transition-colors duration-300">
                            <p className="text-2xl mb-5 text-[#00635B]">{f.icon}</p>
                            <h3 className="text-lg font-bold mb-3 tracking-tight">{f.title}</h3>
                            <p className="text-[#777] text-sm leading-[1.8]">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Premium Rooms Card Widget (Mobile/Tablet) ═══ */}
            <section className="anim px-4 sm:px-6 py-24 bg-[#f8f9fa] flex justify-center w-full md:hidden">
                <div className="relative bg-white border border-[#eaeaea] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] rounded-[32px] p-6 md:p-8 w-full max-w-[540px] overflow-hidden">
                    {/* 상단 미세 하이라이트 효과 (디테일) */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

                    {/* 상단 헤더: Stay Ari */}
                    <div className="flex items-center justify-between mb-8 mt-2 px-1">
                        <div>
                            <h2 className="text-[1.5rem] font-extrabold tracking-tight text-[#1a1a1a]">Stay Ari</h2>
                            <p className="text-[12px] font-medium text-[#888] mt-0.5">프리미엄 지점 둘러보기</p>
                        </div>
                    </div>

                    {/* 2컬럼 객실 사진 그리드 */}
                    <div className="grid grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-8">
                        {rooms.map((r, i) => (
                            <div
                                key={i}
                                className="group cursor-pointer flex flex-col"
                                onClick={() => {
                                    if (r.link !== '#') {
                                        window.open(r.link, '_blank');
                                    } else {
                                        alert(`${r.name} 링크가 등록되지 않았습니다! 채팅창에 링크를 남겨주세요.`);
                                    }
                                }}
                            >
                                <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden mb-3 bg-[#f4f4f4] ring-1 ring-black/5 shadow-sm group-hover:shadow-md transition-all duration-300">
                                    <img
                                        src={r.src}
                                        alt={r.name}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.06] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const span = document.createElement('span');
                                            span.className = 'absolute inset-0 flex flex-col items-center justify-center text-[#999] text-[11px] font-medium tracking-tight bg-gray-50';
                                            span.innerHTML = '<span>사진 누락</span><span class="text-[9px] mt-1 opacity-60">/public' + r.src + '</span>';
                                            e.currentTarget.parentElement!.appendChild(span);
                                        }}
                                    />
                                    {/* 호버 시 나타나는 오버레이 UI */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/95 backdrop-blur-md text-[#1a1a1a] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                                            상세 보기
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1.5">
                                    <p className="text-[14px] font-bold tracking-tight text-[#333] group-hover:text-[#000]">{r.name}</p>
                                    <span className="text-[#888] group-hover:text-[#1a1a1a] transform group-hover:translate-x-1 transition-all">
                                        →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Premium Rooms Interactive Gallery (PC 전용) ═══ */}
            <section className="hidden md:flex relative w-full min-h-[90vh] bg-[#f8f9fa] flex-col items-center justify-center overflow-hidden py-24 select-none">
                <div className="absolute top-16 text-center z-30 pointer-events-none">
                    <h2 className="text-[2rem] font-extrabold tracking-tight text-[#1a1a1a]">Stay Ari Premium</h2>
                    <p className="text-[14px] font-medium text-[#999] mt-1">도쿄 중심부의 특별한 공간</p>
                </div>

                {/* ① 항상 고정 래이어: Takadanobaba 이미지 5장 (호버 시 fade-out) */}
                {(() => {
                    const fixedScatters = [
                        { x: '-33vw', y: '-20vh', rotate: '-7deg', width: '21vw', aspect: '4/5' },
                        { x: '31vw', y: '-18vh', rotate: '6deg', width: '19vw', aspect: '1/1' },
                        { x: '-26vw', y: '22vh', rotate: '5deg', width: '23vw', aspect: '16/9' },
                        { x: '33vw', y: '20vh', rotate: '-5deg', width: '20vw', aspect: '4/5' },
                        { x: '4vw', y: '-30vh', rotate: '3deg', width: '16vw', aspect: '3/4' },
                    ];
                    const takadanobaba = rooms.find(r => r.name === 'Takadanobaba');
                    if (!takadanobaba) return null;
                    return (
                        <div
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{ opacity: hoveredRoom === null ? 1 : 0, transition: 'opacity 0.5s ease' }}
                        >
                            {takadanobaba.hoverImages.map((imgSrc, idx) => {
                                const s = fixedScatters[idx] || fixedScatters[0];
                                return (
                                    <div
                                        key={`fixed-${idx}`}
                                        className="absolute top-1/2 left-1/2 origin-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden"
                                        style={{
                                            width: s.width,
                                            aspectRatio: s.aspect,
                                            transform: `translate(calc(-50% + ${s.x}), calc(-50% + ${s.y})) rotate(${s.rotate}) scale(1)`,
                                        }}
                                    >
                                        <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}

                {/* ② 호버 시 각 객실의 5장 이미지 흩뿌림 레이어 */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    {rooms.map((r, i) => {
                        const isHovered = hoveredRoom === i;
                        const scatters = [
                            { x: '-33vw', y: '-20vh', rotate: '-7deg', width: '21vw', aspect: '4/5' },
                            { x: '31vw', y: '-18vh', rotate: '6deg', width: '19vw', aspect: '1/1' },
                            { x: '-26vw', y: '22vh', rotate: '5deg', width: '23vw', aspect: '16/9' },
                            { x: '33vw', y: '20vh', rotate: '-5deg', width: '20vw', aspect: '4/5' },
                            { x: '4vw', y: '-30vh', rotate: '3deg', width: '16vw', aspect: '3/4' },
                        ];
                        return r.hoverImages.map((imgSrc, idx) => {
                            const s = scatters[idx] || scatters[0];
                            return (
                                <div
                                    key={`hover-${i}-${idx}`}
                                    className="absolute top-1/2 left-1/2 origin-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden"
                                    style={{
                                        width: s.width,
                                        aspectRatio: s.aspect,
                                        transform: isHovered
                                            ? `translate(calc(-50% + ${s.x}), calc(-50% + ${s.y})) rotate(${s.rotate}) scale(1)`
                                            : `translate(-50%, -50%) rotate(0deg) scale(0.6)`,
                                        opacity: isHovered ? 1 : 0,
                                        transition: `opacity 0.5s ease ${idx * 0.04}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 0.04}s`,
                                    }}
                                >
                                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                                </div>
                            );
                        });
                    })}
                </div>

                {/* ③ 중앙 텍스트 리스트 */}
                <div className="relative z-30 flex flex-col items-center justify-center space-y-1 mt-12 w-full max-w-6xl">
                    {rooms.map((r, i) => (
                        <div
                            key={`text-${i}`}
                            className="cursor-pointer px-8 py-2 md:py-3 w-full text-center"
                            onMouseEnter={() => setHoveredRoom(i)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            onClick={() => { if (r.link !== '#') window.open(r.link, '_blank'); }}
                        >
                            <h3
                                className="transition-all duration-300 ease-out italic leading-none"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                                    fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    color: hoveredRoom === i
                                        ? '#00635B'
                                        : hoveredRoom === null
                                            ? '#1a1a1a'
                                            : 'transparent',
                                    WebkitTextStroke: hoveredRoom !== null && hoveredRoom !== i ? '1px rgba(0,0,0,0.15)' : undefined,
                                    opacity: hoveredRoom !== null && hoveredRoom !== i ? 0.35 : 1,
                                    transform: hoveredRoom === i ? 'scale(1.04)' : 'scale(1)',
                                }}
                            >
                                {r.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Full-bleed Street (numa 스타일: 이미지 중간 브레이크) ═══ */}
            <section className="anim relative w-full h-[45vh] md:h-[65vh] overflow-hidden">
                <img src={STREET} alt="Tokyo" className="absolute inset-0 w-full h-full object-cover" />
            </section>

            {/* ═══ Why Join Us (numa 스타일: 2컬럼 텍스트+이미지 + 텍스트 타이핑/드로잉) ═══ */}
            <section className="anim relative py-20 md:py-28 px-6 md:px-10 max-w-[1400px] mx-auto overflow-hidden">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
                    <div className="relative">
                        {/* CSS 기반 필기체 타이핑(드로잉) 애니메이션 */}
                        <div
                            className="absolute -top-14 left-0 md:-left-4 text-[#111111] font-serif italic font-bold tracking-wider text-4xl md:text-5xl opacity-90 overflow-hidden whitespace-nowrap"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                                fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}
                        >
                            <span
                                ref={(el) => {
                                    if (el) {
                                        // 0에서 100%로 width가 늘어나는 타이핑 효과
                                        gsap.fromTo(el,
                                            { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
                                            {
                                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                                                duration: 3.5,
                                                ease: "power2.inOut",
                                                scrollTrigger: {
                                                    trigger: el,
                                                    start: "top 80%",
                                                    toggleActions: "play none none reset"
                                                }
                                            }
                                        );
                                    }
                                }}
                                className="inline-block"
                            >
                                Stay Ari
                            </span>
                        </div>

                        <p className="section-label mt-4">Why Stay Ari</p>
                        <h2
                            className="text-2xl md:text-4xl font-bold leading-snug tracking-tight mb-6 relative inline-block overflow-hidden"
                        >
                            <span
                                ref={(el) => {
                                    if (el) {
                                        gsap.fromTo(el,
                                            { y: '100%', opacity: 0 },
                                            {
                                                y: '0%', opacity: 1, duration: 1.2, ease: "power3.out",
                                                scrollTrigger: {
                                                    trigger: el,
                                                    start: "top 85%",
                                                    toggleActions: "play none none reset"
                                                }
                                            }
                                        );
                                    }
                                }}
                                className="block"
                            >
                                단순한 일이 아닌,<br />
                                특별한 경험을 만드는 일
                            </span>
                        </h2>
                        <p
                            className="text-[#777] text-sm md:text-base leading-[2] mb-4 overflow-hidden"
                            ref={(el) => {
                                if (el) {
                                    gsap.fromTo(el,
                                        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
                                        {
                                            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                                            duration: 2.5,
                                            ease: "power2.inOut",
                                            scrollTrigger: {
                                                trigger: el,
                                                start: "top 85%",
                                                toggleActions: "play none none reset"
                                            }
                                        }
                                    );
                                }
                            }}
                        >
                            Stay Ari에서의 근무는 공간을 관리하는 것을 넘어, 전 세계 여행자들의 도쿄 경험을
                            디자인하는 것입니다. 깨끗한 공간, 따뜻한 환대, 그리고 프로페셔널한 서비스로
                            게스트에게 잊지 못할 추억을 선물합니다.
                        </p>
                    </div>
                    <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-[#f5f5f3]">
                        <img src="/images/hero.jpg" alt="Room" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            {/* ═══ Premium Dark Footer & CTA & Night ═══ */}
            <div className="bg-[#111111] text-white">

                {/* 1) Night View Section - Parallax Effect 극대화 */}
                <section className="anim relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
                    <img
                        src={NIGHT}
                        alt="Tokyo night"
                        className="absolute inset-0 w-full h-full object-cover transform scale-110 opacity-60"
                        style={{ filter: 'brightness(0.8) contrast(1.1)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-transparent" />

                    <div className="absolute bottom-12 md:bottom-20 left-6 md:left-16 z-10 max-w-2xl">
                        <div className="inline-block px-4 py-1.5 border border-white/20 rounded-full bg-white/5 backdrop-blur-md mb-4">
                            <p className="text-[11px] font-bold tracking-widest uppercase text-white/90">Shinjuku, Tokyo</p>
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] drop-shadow-lg">
                            잠들지 않는 <br className="hidden md:block" />
                            가장 매력적인 도시에서
                        </h2>
                    </div>
                </section>

                {/* 2) 럭셔리 CTA Banner (밋밋한 녹색 제거, 그라디언트 + 블러) */}
                <section className="anim relative py-20 md:py-32 px-6 flex flex-col items-center justify-center border-b border-white/10">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[150%] bg-[#00635B] opacity-10 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[120%] bg-[#D4AF37] opacity-5 blur-[100px] rounded-full" />
                    </div>

                    <div className="relative z-10 text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-[2.75rem] font-bold mb-6 tracking-tight leading-tight">
                            아름다운 도쿄에서 만나요
                        </h2>
                        <p className="text-white/60 text-[15px] md:text-base font-medium max-w-md mx-auto leading-relaxed">
                            Stay Ari 팀의 일원이 되어 전 세계 여행자들에게 잊지 못할 럭셔리한 도쿄 경험을 디자인합니다.
                        </p>
                    </div>
                </section>

                {/* 3) Premium Footer & Instagram Link */}
                <footer className="py-12 md:py-16 px-6 md:px-16 mx-auto max-w-[1600px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative z-10">
                    {/* 좌측: 로고 및 카피라이트 */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-xl md:text-2xl font-extrabold tracking-tight">Stay Ari</span>
                        <span className="text-[12px] md:text-[13px] font-medium text-white/40">© 2026 Stay Ari. All rights reserved.</span>
                    </div>

                    {/* 중앙: 관리자 페이지 접속 링크 (직관적 텍스트로 변경) */}
                    <button
                        onClick={() => navigate('/admin')}
                        className="font-serif text-[14px] font-bold text-white/50 hover:text-[#D4AF37] transition-all flex items-center gap-1 group"
                    >
                        Haru Admin
                    </button>

                    {/* 우측: 인스타그램 SNS 연동 */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.instagram.com/tokyo_stayari/reels/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] p-[1.5px] shadow-[0_4px_15px_rgba(225,48,108,0.2)] group-hover:shadow-[0_8px_25px_rgba(225,48,108,0.5)] transition-shadow">
                                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-white/50 group-hover:text-white/90 mt-2 transition-colors">Instagram</span>
                        </a>
                    </div>
                </footer>
            </div>        </div>
    );
};

export default LandingPage;
