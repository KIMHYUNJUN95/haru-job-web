import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

// 임시 플레이스홀더 이미지 (하이엔드 무드용) - 링크 교체 (첫번째 사진 엑박 수정)
const heroBgImg = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop";
const placeholderImg2 = "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop";
const placeholderImg3 = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop";

// HERO_IMAGES 제거 완료 (비디오 소스 사용)

const rooms = [
    {
        src: '/images/arakicho_a.jpg',
        name: 'Arakicho A',
        link: 'https://www.booking.com/hotel/jp/502-6beds-3min-shinjuku1min-metro-pocket-wifi42m-2.ko.html?label=gen173bo-10CAsodUIyNTAyLTZiZWRzLTNtaW4tc2hpbmp1a3UxbWluLW1ldHJvLXBvY2tldC13aWZpNDJtLTJIM1gDaHWIAQGYATO4ARfIAQzYAQPoAQH4AQGIAgGYAgaoAgG4Avichc0GwAIB0gIkZGY0M2FmNjUtMDJkYi00N2M1LTgxNzctYTA4MjFkM2Q5ZDY22AIB4AIB&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/stay-ari-arakicho-b.ko.html?label=gen173bo-10CAsodUITc3RheS1hcmktYXJha2ljaG8tYkgzWANodYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAZgCBqgCAbgCnJ2FzQbAAgHSAiRlZWM4YTUyZS1kZmIyLTQxN2EtOTFjYi1kYmNkZThlOWJkMWHYAgHgAgE&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/shinjuku-jjhouse-kabukicho.ko.html?label=gen173bo-10CAsodUIac2hpbmp1a3Utampob3VzZS1rYWJ1a2ljaG9IM1gDaHWIAQGYATO4ARfIAQzYAQPoAQH4AQGIAgGYAgaoAgG4ArSdhc0GwAIB0gIkYzhiNGVhZGQtNDM1Ni00ZGZlLTkyMDItNjgwZDBhN2I3NzMw2AIB4AIB&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/jj-house-dong-xin-su.ko.html?label=gen173bo-10CAsodUIUamotaG91c2UtZG9uZy14aW4tc3VIM1gDaHWIAQGYATO4ARfIAQzYAQPoAQH4AQGIAgGYAgaoAgG4Auudhc0GwAIB0gIkMDUwZjMzY2ItYTM1NC00NjUyLTk5M2QtYzg4NmRiNTdhZTY02AIB4AIB&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/okubo4.ko.html?label=gen173bo-10CAsodUIGb2t1Ym80SDNYA2h1iAEBmAEzuAEXyAEM2AED6AEB-AEBiAIBmAIGqAIBuAKunoXNBsACAdICJDgxM2ZiZjQwLTZlZGQtNDgxNy05ODlhLWZmZTA1ODVkN2UxYtgCAeACAQ&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/new-twelve-people-shin-ookubo-6min-pocket-wifi.ko.html?label=gen173bo-10CAsodUIubmV3LXR3ZWx2ZS1wZW9wbGUtc2hpbi1vb2t1Ym8tNm1pbi1wb2NrZXQtd2lmaUgzWANodYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAZgCBqgCAbgCz56FzQbAAgHSAiRiZGE4NjczMy1mYWE0LTQzOTktODQ3Zi02OTRiY2ZhODU4M2bYAgHgAgE&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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
        link: 'https://www.booking.com/hotel/jp/stay-ari-apatomentohotel-63ping-mi.ko.html?label=gen173bo-10CAsodUIic3RheS1hcmktYXBhdG9tZW50b2hvdGVsLTYzcGluZy1taUgzWANodYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAZgCBqgCAbgC0p2FzQbAAgHSAiQ4YmQ3MzkxNy02NGRkLTQ2MWMtYTkxMS1jMzZhNWU3ZmE1MDXYAgHgAgE&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
        hoverImages: [
            '/images/takadanobaba.jpg',
            '/images/takadanobaba/1.jpg',
            '/images/takadanobaba/2.jpg',
            '/images/takadanobaba/3.jpg',
            '/images/takadanobaba/4.jpg'
        ]
    },
];


// 완벽한 도쿄 신주쿠 다크/네온 테마 4K 워킹 비디오 (YTN/Walking 채널 등 로고 없는 깔끔한 뷰)

const LandingPage = () => {
    const navigate = useNavigate();
    const [todayVisitors, setTodayVisitors] = useState<number>(0);

    // 스크롤 애니메이션 (패럴랙스)
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 1000], ['0%', '20%']);

    // 오늘 방문자 수 카운터 (Firestore)
    useEffect(() => {
        const trackVisit = async () => {
            // 도쿄 시간 기준으로 날짜 생성 (UTC+9 적용)
            const today = new Intl.DateTimeFormat('sv-SE', { 
                timeZone: 'Asia/Tokyo', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(new Date()); // YYYY-MM-DD format
            const docRef = doc(db, 'siteStats', `visitors_${today}`);
            const alreadyCounted = sessionStorage.getItem('visited_today');

            try {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    if (!alreadyCounted) {
                        await updateDoc(docRef, { count: increment(1) });
                        sessionStorage.setItem('visited_today', today);
                    }
                    const updated = await getDoc(docRef);
                    setTodayVisitors(updated.data()?.count || 0);
                } else {
                    await setDoc(docRef, { count: 1, date: today });
                    sessionStorage.setItem('visited_today', today);
                    setTodayVisitors(1);
                }
            } catch (e) {
                console.error('Visitor tracking error:', e);
            }
        };
        trackVisit();
    }, []);

    // ─── Tokyo Real-time Clock (Ultra-Premium Detail) ───
    const [tokyoTime, setTokyoTime] = useState<string>('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('ko-KR', {
                timeZone: 'Asia/Tokyo',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setTokyoTime(formatter.format(now));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Other Global scroll animations
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

            {/* ─── Top Nav (글래스모피즘 + 모바일 반응형 텍스트 최적화) ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        {/* ARIA TOKYO 로고 구역 (텍스트만) */}
                        <span className="text-[14px] md:text-[15px] font-extrabold tracking-widest text-[#212322] font-serif uppercase">Aria Tokyo</span>
                        {todayVisitors > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-medium text-[#aaa] tracking-wide ml-1">TODAY {todayVisitors}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
                        <span className="hidden md:inline text-[13px] text-[#888] font-medium">Shinjuku, Tokyo</span>
                        <button onClick={() => navigate('/notice')} className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#555] hover:text-[#212322] transition-colors py-2 px-1.5 sm:px-3">
                            Notice
                        </button>
                        <button onClick={() => navigate('/faq')} className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#555] hover:text-[#212322] transition-colors py-2 px-1.5 sm:px-3">
                            FAQ
                        </button>
                        <button 
                            onClick={() => navigate('/jobs')}
                            className="bg-[#212322] text-white text-[11px] sm:text-[12px] md:text-[13px] font-bold py-2 px-3 sm:px-5 rounded-full hover:bg-black transition-all shadow-sm"
                        >
                            지원하기
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══ NEW HERO — Modern Realistic Corporate Style ═══ */}
            <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-[#0f172a] flex items-end px-4 sm:px-6 md:px-16 pb-28 md:pb-40 box-border group">
                {/* 배경 이미지: 생성된 트와일라잇 모던 빌딩 이미지 사용 */}
                <motion.div className="absolute inset-0 w-full h-full pointer-events-none" style={{ y: heroY, scale: 1.05 }}>
                    <img
                        src="/images/hero_custom.png"
                        alt="Modern Building Twilight"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[12s] ease-out group-hover:scale-110 opacity-80"
                    />
                    {/* 어두운 블루/블랙 오버레이 (텍스트 가독성 확보) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/40 to-transparent" />
                </motion.div>

                {/* 좌측 하단 텍스트 영역 */}
                <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col justify-end h-full">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-xl md:max-w-3xl px-2 mb-8 md:mb-16"
                    >
                        <h1 className="text-white font-extrabold leading-[1.2] tracking-tight mb-4 md:mb-6 text-4xl sm:text-5xl md:text-6xl break-keep drop-shadow-2xl">
                            ARIA TOKYO,<br />
                            도쿄의 럭셔리를<br className="sm:hidden" /> 완성하다.
                        </h1>
                        <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium tracking-tight leading-relaxed max-w-lg break-keep drop-shadow-md border-l-2 border-blue-500 pl-4">
                            세계적인 여행자들에게 잊지 못할 숙박 경험을 제공할<br className="hidden md:block"/>
                            열정적인 호텔리어를 찾습니다.
                        </p>
                    </motion.div>
                </div>

                {/* 하단 겹치는 카드 탭 영역 (스플릿 CTA) */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-16 flex items-end translate-y-4 md:translate-y-6 z-20"
                >
                    <div className="w-full sm:w-[500px] md:w-[600px] flex pb-6 md:pb-8 flex-col rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden bg-[#1e293b]">
                        <div className="flex flex-row w-full h-full">
                            {/* 1번 탭: 입사지원 */}
                            <div 
                                className="flex-1 bg-[#2563eb] text-white p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-blue-600 transition-colors flex flex-col justify-center group"
                                onClick={() => navigate('/jobs')}
                            >
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2">
                                    채용 공고 <span className="transform transition-transform group-hover:translate-x-1 ml-0.5 sm:ml-1 font-light opacity-90">→</span>
                                </h3>
                                <p className="text-[10px] sm:text-[12px] md:text-[13px] text-white/90 break-keep mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                                    현재 진행 중인 ARIA TOKYO의 포지션 확인
                                </p>
                            </div>
                            {/* 2번 탭: 공지사항 */}
                            <div 
                                className="flex-1 bg-[#1e293b] text-white p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-[#334155] transition-colors flex flex-col justify-center group border-l border-white/10"
                                onClick={() => navigate('/notice')}
                            >
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2 text-gray-100">
                                    공지사항 <span className="transform transition-transform group-hover:translate-x-1 ml-0.5 sm:ml-1 font-light opacity-60">→</span>
                                </h3>
                                <p className="text-[10px] sm:text-[12px] md:text-[13px] text-gray-400 break-keep mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                                    ARIA TOKYO의 새로운 소식
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3D 기어 아이콘 같은 장식 포인트 (우측) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="absolute right-[-5%] lg:right-[5%] xl:right-[10%] top-1/2 -translate-y-1/2 hidden md:block pointer-events-none drop-shadow-2xl opacity-90"
                >
                    <div className="w-60 h-60 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-600 to-[#1e293b] rounded-full blur-[80px] opacity-40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>
                    {/* 입체감을 살릴 3D 오브젝트나 기어 느낌의 투명 PNG를 임시 배치 */}
                    <img 
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/folder-4993510-4158913.png" 
                        alt="3D Badge" 
                        className="w-[280px] lg:w-[420px] object-contain relative z-10 floating-anim filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform -rotate-6"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </motion.div>
                
                {/* Floating animation keyframes embedded directly in inline style just for this component or add to tailwind */}
                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(-6deg); }
                        50% { transform: translateY(-20px) rotate(-2deg); }
                        100% { transform: translateY(0px) rotate(-6deg); }
                    }
                    .floating-anim {
                        animation: float 7s ease-in-out infinite;
                    }
                `}</style>
            </section>

            {/* ═══ NEW: Why Join Us (Ultra-Premium Asymmetrical Web Design) ═══ */}
            <section className="relative w-full bg-white pt-32 pb-48 lg:pt-40 lg:pb-56 px-4 sm:px-6 z-10 border-t border-gray-100/50 overflow-hidden">
                {/* 하이엔드 무드의 초대형 블러 배경 */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(248,250,252,1)_0%,rgba(255,255,255,0)_70%)] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(240,253,244,0.4)_0%,rgba(255,255,255,0)_60%)] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none -z-10"></div>

                <div className="max-w-[1500px] mx-auto relative px-4 md:px-8">
                    {/* 1. 하이엔드 에디토리얼 타이틀 영역 */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 md:mb-32 lg:mb-40 gap-12 xl:gap-20">
                        <div className="relative">
                            <motion.div 
                                className="inline-flex items-center gap-4 mb-6 md:mb-8"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <span className="w-12 md:w-16 h-[1px] bg-[#00635B] inline-block origin-left"></span>
                                <p className="text-[#00635B] tracking-[0.3em] text-[10px] md:text-[11px] font-bold uppercase">
                                    Why Stay Ari
                                </p>
                            </motion.div>
                            
                            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[1.02] tracking-tighter text-[#111]">
                                <motion.span 
                                    className="block overflow-hidden"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    매일의 일상이,
                                </motion.span>
                                <motion.span 
                                    className="block text-[#999] italic font-serif mt-2 xl:mt-4 font-normal tracking-wide"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                >
                                    Extraordinary Value
                                </motion.span>
                            </h2>
                        </div>

                        <motion.div 
                            className="xl:max-w-[28rem] relative"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#00635B] to-transparent hidden xl:block"></div>
                            <p className="text-[#555] text-base md:text-[17px] lg:text-[19px] leading-[1.8] break-keep font-medium xl:pl-8">
                                우리는 단순히 방을 비우고 치우는 것을 넘어, 가장 완벽하게 정제된 <strong className="text-[#111] font-bold border-b border-[#111]/30 pb-0.5">최상의 컨디션</strong>을 재창조합니다. 
                                <br className="hidden md:block"/>STAY ARI와 함께 글로벌 라이프스타일의 새로운 기준을 만들어가세요.
                            </p>
                        </motion.div>
                    </div>

                    {/* 2. 어워즈급 비대칭 이미지+텍스트 카드 그리드 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
                        {[
                            {
                                num: '01',
                                highlight: '디테일에 대한 긍지',
                                title: 'Pride in Precision',
                                desc: '티끌 하나 없는 완벽한 공간을 통제하고 완성하는 자부심. 우리가 준비한 섬세한 컨디션은 곧 게스트의 잊을 수 없는 경험과 감동이 됩니다.',
                                imgUrl: heroBgImg, // Hero의 호텔 배경 이미지를 마스크 씌워서 재활용
                                accent: '#00635B',
                                mt: 'lg:mt-0',
                            },
                            {
                                num: '02',
                                highlight: '세계와 소통하는 접점',
                                title: 'Global Standard',
                                desc: '국경을 넘어 도쿄를 찾는 수많은 이들. 그들의 가장 사적인 휴식 공간을 책임지며, 세계적 수준의 하이엔드 호스피탈리티를 체득합니다.',
                                imgUrl: placeholderImg2, // 두 번째 이미지 Placeholder (프리미엄 룸)
                                accent: '#D4AF37',
                                mt: 'lg:mt-32',
                            },
                            {
                                num: '03',
                                highlight: '혁신적 업무 플랫폼',
                                title: 'Smart & Flexible',
                                desc: '모바일에 최적화된 스마트 체크인과 직관적인 디지털 매뉴얼. 비효율적인 관습을 버리고 오직 본질적인 가치 향상에만 집중합니다.',
                                imgUrl: placeholderImg3, // 세 번째 이미지 Placeholder (깔끔한 공간)
                                accent: '#111111',
                                mt: 'lg:mt-64',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className={`group relative flex flex-col ${item.mt}`}
                                initial={{ opacity: 0, y: 80 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-15%" }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                            >
                                {/* 이미지 마스크 (Pill Shape / Capsule) - 매우 모던한 형태 */}
                                <div className="relative w-full aspect-[4/5] object-cover rounded-[10rem] overflow-hidden mb-10 transform transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-4 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-0"></div>
                                    <img 
                                        src={item.imgUrl} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transform transition-transform duration-[2s] ease-out group-hover:scale-110"
                                    />
                                    
                                    {/* 이미지 위 오버레이 숫자 (가려지지 않게 안쪽으로 이동) */}
                                    <div className="absolute top-10 right-12 z-20 overflow-hidden mix-blend-exclusion text-white/90 font-serif italic text-4xl lg:text-5xl">
                                        <motion.div 
                                            initial={{ y: "100%" }}
                                            whileInView={{ y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 }}
                                        >
                                            {item.num}
                                        </motion.div>
                                    </div>
                                    
                                    {/* 이미지 위 아이콘 동그라미 (Hover 시 등장) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none">
                                        <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={item.accent} strokeWidth="1.5">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 텍스트 영역 */}
                                <div className="flex flex-col flex-1 px-4 lg:px-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.accent }}></span>
                                        <span className="text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase text-gray-800">
                                            {item.highlight}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-3xl md:text-[2rem] lg:text-[2.2rem] font-bold mb-5 tracking-tight text-[#111] font-serif leading-[1.1]">
                                        {item.title}
                                    </h3>
                                    
                                    <div className="w-full h-[1px] bg-gray-200 mb-6 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 h-full w-full bg-[#111] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                                    </div>
                                    
                                    <p className="text-gray-500 text-[15px] md:text-[16px] leading-[1.8] break-keep font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Premium Rooms Minimal Gallery (모바일 전용) ═══ */}
            <section className="anim block md:hidden w-full px-6 py-20 bg-[#ffffff] select-none text-center">
                <div className="mb-14">
                    <p className="section-label mb-2 text-[#00635B] tracking-widest text-[11px] font-bold">STAY ARI ROOMS</p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#111] leading-tight mb-2 font-serif italic">
                        Curated Spaces for Your Taste
                    </h2>
                    <p className="text-[#888] text-[13px] leading-relaxed">
                        가장 프라이빗하고 특별한 도쿄의 일상을 경험해보세요.

                    </p>
                </div>

                {/* 극강의 미니멀리즘 대형 카드 리스트 (세로 배열 1열, 여백 최적화) */}
                <div className="flex flex-col gap-12 sm:gap-16 max-w-[420px] mx-auto">
                    {rooms.map((r, i) => (
                        <div
                            key={`mobile-room-${i}`}
                            className="group cursor-pointer text-left flex flex-col items-center"
                            onClick={() => {
                                if (r.link && r.link !== '#') {
                                    window.open(r.link, '_blank');
                                } else {
                                    alert(`${r.name} 링크가 등록되지 않았습니다.`);
                                }
                            }}
                        >
                            <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden mb-5 bg-[#f8f9fa] shadow-sm">
                                <img
                                    src={r.src}
                                    alt={r.name}
                                    className="absolute inset-0 w-full h-full object-cover transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-active:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const span = document.createElement('span');
                                        span.className = 'absolute inset-0 flex flex-col items-center justify-center text-[#bbb] text-[11px] tracking-widest bg-gray-50';
                                        span.innerHTML = 'IMAGE NOT FOUND';
                                        e.currentTarget.parentElement!.appendChild(span);
                                    }}
                                />
                                {/* 가벼운 오버레이 */}
                                <div className="absolute inset-0 bg-black/0 group-active:bg-black/10 transition-colors duration-300" />
                            </div>

                            {/* 하단 텍스트 영역: 여백 극대화 및 세리프체 포인트 */}
                            <div className="w-full flex items-end justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#111] leading-none mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {r.name}
                                    </h3>
                                    <span className="text-[10px] font-semibold text-[#888] tracking-[0.15em] uppercase">
                                        Tokyo, Japan
                                    </span>
                                </div>
                                <span className="text-[#111] opacity-50 text-xl font-light mb-1">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Premium Rooms High-End Grid Gallery (PC 전용) - Ultra Luxury Edition ═══ */}
            <section className="hidden md:block w-full px-8 lg:px-12 xl:px-20 py-32 lg:py-48 bg-[#f8f9fa] select-none border-t border-gray-100 overflow-hidden relative">
                {/* 우아한 라이팅 효과 (배경 텍스처 요소) */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,rgba(255,255,255,0)_70%)] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(0,99,91,0.02)_0%,rgba(255,255,255,0)_70%)] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-[1600px] mx-auto relative z-10">
                    {/* Header: 하이엔드 럭셔리 스타일 */}
                    <div className="mb-32 lg:mb-40 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200/60 pb-12">
                        <div>
                            <motion.p 
                                className="text-[#00635B] tracking-[0.3em] text-[11px] lg:text-[12px] font-bold uppercase mb-8 flex items-center gap-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                            >
                                <span className="w-16 h-[1.5px] bg-gradient-to-r from-[#00635B] to-transparent inline-block"></span>
                                STAY ARI ROOMS
                            </motion.p>
                            <h2 className="text-5xl lg:text-7xl xl:text-[5.5rem] font-extrabold tracking-tight text-[#111] leading-[1.05] font-serif pr-8 overflow-hidden">
                                <motion.span 
                                    className="block relative"
                                    initial={{ y: "110%", rotate: 2 }}
                                    whileInView={{ y: "0%", rotate: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    Curated Spaces
                                </motion.span>
                                <motion.span 
                                    className="block text-[#888] italic pr-4"
                                    initial={{ y: "110%", rotate: 2 }}
                                    whileInView={{ y: "0%", rotate: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                >
                                    for Your Taste.
                                </motion.span>
                            </h2>
                        </div>
                        <motion.div 
                            className="mt-10 md:mt-0 text-[#666] text-[16px] lg:text-[18px] leading-[1.9] max-w-sm font-medium relative"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        >
                            <span className="absolute -left-6 top-2 w-[2px] h-8 bg-[#D4AF37] opacity-60"></span>
                            가장 프라이빗하고 특별한 도쿄의 일상.<br/>
                            하이엔드 호스피탈리티의 정수를 경험하세요.
                        </motion.div>
                    </div>

                    {/* 어워즈급 비대칭 그리드 (Ultra-Premium Interactions) */}
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-12 lg:gap-x-20 gap-y-32 lg:gap-y-40">
                        {rooms.map((r, i) => (
                            <motion.div
                                key={`desktop-room-v2-${i}`}
                                className={`group cursor-pointer flex flex-col relative w-full ${i % 3 === 1 ? 'xl:mt-48 xl:-mb-16' : (i % 3 === 2 ? 'xl:mt-24' : 'mt-0')}`}
                                initial={{ opacity: 0, y: 120, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-15%" }}
                                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.15 }}
                                onClick={() => {
                                    if (r.link && r.link !== '#') {
                                        window.open(r.link, '_blank');
                                    } else {
                                        alert(`${r.name} 링크가 등록되지 않았습니다.`);
                                    }
                                }}
                            >
                                {/* 이미지 마스크 컨테이너 (3D Tilt & Deep Scaling) */}
                                <div 
                                    className="relative w-full aspect-[4/5.2] lg:aspect-[3/4.2] rounded-[1.5rem] overflow-hidden mb-10 bg-[#eef0f2] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] transition-all duration-[1s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transform-gpu perspective-[1000px]"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    
                                    {/* GSAP 패럴랙스를 위한 내부 래퍼 (Hover 시 3D 틸팅 효과 시뮬레이션) */}
                                    <div className="absolute inset-[-15%] w-[130%] h-[130%] overflow-hidden transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu group-hover:rotate-x-[2deg] group-hover:rotate-y-[-2deg] group-hover:scale-95 group-hover:-translate-y-4 origin-center">
                                        <img
                                            src={r.src}
                                            alt={r.name}
                                            className="w-full h-full object-cover transition-all duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.02] group-hover:scale-[1.08] group-hover:brightness-[0.85] group-hover:saturate-[1.1]"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        
                                        {/* Hover 시 고급스럽게 타오르는 듯한 크로스페이드 (존재하는 경우만) */}
                                        {r.hoverImages && r.hoverImages[1] && (
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1.2s] ease-in-out z-10 pointer-events-none mix-blend-lighten">
                                                <img src={r.hoverImages[1]} alt="" className="w-full h-full object-cover transition-transform duration-[3s] ease-out scale-110 group-hover:scale-100" />
                                            </div>
                                        )}
                                    </div>

                                    {/* 플로팅 글래스 버튼 (초프리미엄 디테일) */}
                                    <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex items-center justify-center">
                                        <div className="relative flex items-center justify-center w-36 h-36 rounded-full transform scale-0 group-hover:scale-100 transition-all duration-[1s] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-4">
                                            {/* 버튼 링 애니메이션 */}
                                            <div className="absolute inset-0 rounded-full border border-white/40 animate-spin-slow" style={{ animationDuration: '8s' }}></div>
                                            {/* 메인 버튼 본체 */}
                                            <div className="absolute w-[85%] h-[85%] rounded-full bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center">
                                                <span className="text-white text-[9px] font-bold tracking-[0.3em] mb-1 opacity-90">DISCOVER</span>
                                                <span className="text-white text-[9px] font-bold tracking-[0.3em] opacity-90">THE SUITE</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 깊이감을 더하는 시네마틱 오버레이 코너 글라데이션 */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                </div>

                                {/* 하단 텍스트 영역 (한 줄 유지 + 클리핑 리빌 애니메이션) */}
                                <div className="w-full flex items-end justify-between px-2 cursor-pointer relative z-20 overflow-visible">
                                    <div className="w-[85%] pr-6 relative">
                                        {/* 텍스트 1줄 유지 클리핑 & 밀어주기 효과 */}
                                        <div className="overflow-hidden relative pb-1">
                                            {/* 기본 상태 텍스트 (호버 시 위로 스르륵 사라짐) */}
                                            <h3 className="text-[2rem] lg:text-[2.6rem] xl:text-[3rem] font-extrabold text-[#111] leading-none font-serif tracking-tight whitespace-nowrap overflow-hidden text-ellipsis transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[110%] group-hover:opacity-0 relative z-10">
                                                {r.name}
                                            </h3>
                                            {/* 호버 시 밑에서 부드럽게 밀려오는 이탤릭체 (한 줄 유지) */}
                                            <h3 className="text-[2rem] lg:text-[2.6rem] xl:text-[3rem] font-extrabold text-[#111] leading-none font-serif tracking-tight italic whitespace-nowrap overflow-hidden text-ellipsis transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] -translate-y-[110%] translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 absolute top-0 left-0 w-full z-20">
                                                {r.name}
                                            </h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-5 mt-4">
                                            {/* 골드 라인 확장 애니메이션 */}
                                            <span className="w-10 h-[1.5px] bg-gray-200 relative overflow-hidden shrink-0">
                                                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#D4AF37] to-[#e6c65e] transform -translate-x-[101%] transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0"></span>
                                            </span>
                                            <span className="text-[10px] lg:text-[11px] font-bold text-[#888] tracking-[0.25em] uppercase transition-colors duration-[0.8s] group-hover:text-[#111] whitespace-nowrap">
                                                Tokyo, Japan
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* 화살표 버튼 (Hover 시 45도 회전 → 대각선 방향) */}
                                    <div className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-full border border-gray-200/80 flex items-center justify-center transition-all duration-[0.7s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#111] group-hover:border-[#111] shadow-[0_8px_20px_-5px_rgba(0,0,0,0.05)] group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)]">
                                        <svg className="w-5 h-5 text-[#555] group-hover:text-white transition-all duration-[0.7s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 하단 여백 추가 (Street 이미지 대체) */}
            <div className="w-full h-32 bg-[#f8f9fa]"></div>

            {/* ═══ CTA SECTION ═══ */}
            <section className="anim w-full px-6 py-28 bg-[#fdfdfd] flex flex-col items-center justify-center text-center">
                <div className="max-w-xl">
                    <h2 className="text-[2rem] md:text-[3rem] font-extrabold text-[#212322] leading-tight mb-6 break-keep">
                        Stay Ari와 함께<br />새로운 도약을 시작하세요.
                    </h2>
                    <p className="text-[#666] text-sm md:text-base mb-10 break-keep">
                        우리는 단순한 숙소가 아닌, 여행자의 삶에 영감을 주는 공간을 만듭니다.<br />
                        당신의 열정으로 특별한 공간을 완성해주세요.
                    </p>

                </div>
            </section>

            {/* ─── Ultra-Premium Footer ─── */}
            <footer className="w-full pt-20 md:pt-32 pb-12 md:pb-16 px-6 md:px-16 bg-white border-t border-gray-100 relative overflow-hidden">
                {/* 대형 배경 텍스트 (ARIA TOKYO) */}
                <div className="absolute top-10 right-10 md:right-40 text-[7rem] md:text-[14rem] lg:text-[18rem] font-black text-[#f8f9fa] select-none pointer-events-none tracking-tighter italic whitespace-nowrap opacity-80">
                    ARIA TOKYO
                </div>

                <div className="max-w-[1600px] mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                        
                        {/* 1. Brand Pillar & Vision (4 cols) */}
                        <div className="lg:col-span-4 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div>
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="flex items-center justify-center lg:justify-start gap-4 mb-6"
                                    >
                                        <span className="text-[24px] font-black text-[#212322] tracking-widest font-serif uppercase">Aria Tokyo</span>
                                        <span className="w-8 h-[1px] bg-[#212322]/20"></span>
                                        <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Tokyo Luxury</span>
                                    </motion.div>
                                <p className="text-[16px] md:text-[18px] text-[#212322] font-semibold leading-relaxed font-serif italic mb-8 max-w-sm mx-auto lg:mx-0">
                                    "We curate not just rooms, but the very essence of Tokyo's sophisticated lifestyle."
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center lg:justify-start gap-3 text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Live in Tokyo: {tokyoTime} JST
                                    </div>
                                    <a 
                                        href="https://www.google.com/maps/search/?api=1&query=Tokyo+Shinjuku+City+Sumiyoshicho+2-10"
                                        target="_blank" rel="noopener noreferrer"
                                        className="block text-[12px] text-[#666] leading-relaxed hover:text-[#212322] transition-colors"
                                    >
                                        Tokyo Shinjuku City, Sumiyoshicho 2-10<br />
                                        162-0065, Japan
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 2. Exploration & Links (5 cols) */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-10 text-center lg:text-left">
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-extrabold tracking-[0.3em] text-[#212322] uppercase opacity-40">Resources</h4>
                                <ul className="space-y-4">
                                    {['Notice', 'FAQ', 'Company'].map((item) => (
                                        <li key={item}>
                                            <button 
                                                onClick={() => navigate(`/${item.toLowerCase()}`)}
                                                className="group flex items-center justify-center lg:justify-start gap-2 text-[14px] font-semibold text-[#555] hover:text-[#212322] transition-colors"
                                            >
                                                <span className="hidden lg:inline-block w-0 group-hover:w-4 h-[1px] bg-[#212322] transition-all duration-300 overflow-hidden"></span>
                                                {item}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-extrabold tracking-[0.3em] text-[#212322] uppercase opacity-40">Legal & Privacy</h4>
                                <ul className="space-y-4">
                                    {['Terms', 'Privacy', 'Admin'].map((item) => (
                                        <li key={item}>
                                            <button 
                                                onClick={() => navigate(`/${item.toLowerCase()}`)}
                                                className="group flex items-center justify-center lg:justify-start gap-2 text-[14px] font-semibold text-[#555] hover:text-[#212322] transition-colors"
                                            >
                                                <span className="hidden lg:inline-block w-0 group-hover:w-4 h-[1px] bg-[#D4AF37] transition-all duration-300 overflow-hidden"></span>
                                                {item}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 3. Connect & Signature (3 cols) */}
                        <div className="lg:col-span-3 flex flex-col justify-between items-center lg:items-end">
                            <motion.a 
                                href="https://www.instagram.com/tokyo_stayari/reels/"
                                target="_blank" rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                className="group p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 w-full"
                            >
                                <div className="flex items-center justify-center lg:justify-between mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                                    </div>
                                    <div className="hidden lg:flex w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[#212322] group-hover:border-[#212322] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </div>
                                </div>
                                <p className="text-[15px] font-bold text-[#212322]">@tokyo_stayari</p>
                            </motion.a>
                            
                            <div className="mt-12 text-center lg:text-right w-full">
                                <p className="text-[10px] font-bold tracking-[0.4em] text-[#bbb] uppercase mb-2">Developed with Passion</p>
                                <span className="text-[12px] font-black text-[#212322] opacity-20">Antigravity AI Design System</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 text-[11px] font-bold text-[#999] tracking-widest uppercase">
                            <span>Since 2024</span>
                            <span className="w-1 h-1 rounded-full bg-[#bbb]"></span>
                            <span>Tokyo HQ</span>
                        </div>
                        <p className="text-[11px] text-[#bbb] font-medium italic text-center md:text-right">
                            Elevating the standard of living in the world's most vibrant city.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
