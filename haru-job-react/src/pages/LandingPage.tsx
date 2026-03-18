import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowUpRight, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { sendSlackNotification } from '../utils/slack';
import InquiryForm from '../components/Chat/InquiryForm';
import ChatWindow from '../components/Chat/ChatWindow';

gsap.registerPlugin(ScrollTrigger);

// 임시 플레이스홀더 이미지 (하이엔드 무드용) - 링크 교체 (첫번째 사진 엑박 수정)
const heroBgImg = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop";
const placeholderImg2 = "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop";
const placeholderImg3 = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop";

const rooms = [
    {
        src: '/images/arakicho_a.jpg',
        name: 'Arakicho A',
        link: 'https://www.booking.com/hotel/jp/502-6beds-3min-shinjuku1min-metro-pocket-wifi42m-2.ko.html?label=gen173bo-10CAsodUIyNTAyLTZiZWRzLTNtaW4tc2hpbmp1a3UxbWluLW1ldHJvLXBvY2tldC13aWZpNDJtLTJIM1gDaHWIAQGYATO4ARfIAQzYAQPoAQH4AQGIAgGYAgaoAgG4Avichc0GwAIB0gIkZGY0M2FmNjUtMDJkYi00N2M1LTgxNzctYTA4MjFkZDNkOWQ2NjJAgHgAgE&sid=1d608935b744cbcd954706368a5f45bd&dist=0&sb_price_type=total&type=total&',
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

const LandingPage = () => {
    const navigate = useNavigate();
    const [todayVisitors, setTodayVisitors] = useState<number>(0);

    // 스크롤 애니메이션 (패럴랙스)
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 1000], ['0%', '20%']);

    // 오늘 방문자 수 카운터 (Firestore)
    useEffect(() => {
        const trackVisit = async () => {
            const today = new Intl.DateTimeFormat('sv-SE', { 
                timeZone: 'Asia/Tokyo', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(new Date());
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

    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(localStorage.getItem('chatRoomId'));
    const [applicantName, setApplicantName] = useState<string>(localStorage.getItem('applicantName') || '');
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

    useEffect(() => {
        document.querySelectorAll('.anim').forEach((el) => {
            gsap.fromTo(el, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' },
            });
        });
    }, []);

    const handleInquirySubmit = async (data: { name: string; phone: string; gender: string; age: string }) => {
        try {
            const roomRef = await addDoc(collection(db, 'chat_rooms'), {
                ...data,
                createdAt: serverTimestamp(),
                lastMessage: '상담이 시작되었습니다.',
                lastMessageTime: serverTimestamp(),
                status: 'open'
            });

            const newRoomId = roomRef.id;
            localStorage.setItem('chatRoomId', newRoomId);
            localStorage.setItem('applicantName', data.name);
            setRoomId(newRoomId);
            setApplicantName(data.name);

            await sendSlackNotification(`🔔 새로운 채용 문의가 도착했습니다!\n이름: ${data.name}\n나이: ${data.age}세\n성별: ${data.gender}\n연락처: ${data.phone}`);

        } catch (error) {
            console.error('Error creating chat room:', error);
        }
    };

    return (
        <div className="bg-white min-h-screen">

            {/* ─── Top Nav ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-[14px] md:text-[15px] font-extrabold tracking-widest text-[#212322] font-serif uppercase">Stay Ari Tokyo</span>
                        {todayVisitors > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-medium text-[#aaa] tracking-wide ml-1">TODAY {todayVisitors}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
                        <span className="hidden md:inline text-[13px] text-[#888] font-medium">Shinjuku, Tokyo</span>
                        <button onClick={() => navigate('/notice')} className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#555] hover:text-[#212322] transition-colors py-2 px-1.5 sm:px-3">Notice</button>
                        <button onClick={() => navigate('/faq')} className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#555] hover:text-[#212322] transition-colors py-2 px-1.5 sm:px-3">FAQ</button>
                        <button onClick={() => navigate('/jobs')} className="bg-[#212322] text-white text-[11px] sm:text-[12px] md:text-[13px] font-bold py-2 px-3 sm:px-5 rounded-full hover:bg-black transition-all shadow-sm">지원하기</button>
                    </div>
                </div>
            </nav>

            {/* ═══ NEW HERO — Modern Realistic Corporate Style ═══ */}
            <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-[#0f172a] flex items-end px-4 sm:px-6 md:px-16 pb-28 md:pb-40 box-border group">
                <motion.div className="absolute inset-0 w-full h-full pointer-events-none" style={{ y: heroY, scale: 1.05 }}>
                    <img src="/images/hero_custom.png" alt="Modern Building" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/20" />
                </motion.div>

                <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col justify-end h-full">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-xl md:max-w-3xl px-2 mb-8 md:mb-16">
                        <h1 className="text-white font-extrabold leading-[1.2] tracking-tight mb-4 md:mb-6 text-4xl sm:text-5xl md:text-6xl break-keep drop-shadow-2xl">STAY ARI TOKYO,<br />도쿄의 럭셔리를 완성하다.</h1>
                        <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium border-l-2 border-blue-500 pl-4">세계적인 여행자들에게 잊지 못할 숙박 경험을 제공할<br className="hidden md:block"/>열정적인 호텔리어를 찾습니다.</p>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="absolute bottom-0 left-0 right-0 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-16 flex items-end translate-y-4 md:translate-y-6 z-20">
                    <div className="w-full sm:w-[500px] md:w-[600px] flex pb-6 md:pb-8 flex-col rounded-t-2xl shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden bg-[#1e293b]">
                        <div className="flex flex-col sm:flex-row w-full h-full">
                            <div className="flex-1 bg-[#2563eb] text-white p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-blue-600 transition-colors group" onClick={() => navigate('/jobs')}>
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2">채용 공고 <span className="transform transition-transform group-hover:translate-x-1">→</span></h3>
                                <p className="text-[10px] sm:text-[12px] md:text-[13px] text-white/90">진행 중인 포지션 확인</p>
                            </div>
                            <div className="flex-1 bg-[#1e293b] text-white p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-[#334155] transition-colors group sm:border-l border-t sm:border-t-0 border-white/10" onClick={() => navigate('/notice')}>
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2">공지사항 <span className="transform transition-transform group-hover:translate-x-1">→</span></h3>
                                <p className="text-[10px] sm:text-[12px] md:text-[13px] text-gray-400">새로운 소식</p>
                            </div>
                            <div className="flex-1 bg-[#1e293b] text-white p-4 sm:p-5 md:p-6 cursor-pointer hover:bg-[#334155] transition-colors group sm:border-l border-t sm:border-t-0 border-white/10" onClick={() => setIsInquiryOpen(true)}>
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2">채용 문의 <span className="transform transition-transform group-hover:translate-x-1">→</span></h3>
                                <p className="text-[10px] sm:text-[12px] md:text-[13px] text-gray-400">1:1 실시간 상담</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(-6deg); }
                        50% { transform: translateY(-20px) rotate(-2deg); }
                        100% { transform: translateY(0px) rotate(-6deg); }
                    }
                    .floating-anim { animation: float 7s ease-in-out infinite; }
                `}</style>
            </section>

            {/* ═══ Why Join Us (Ultra-Premium Asymmetrical Web Design) ═══ */}
            <section className="relative w-full bg-white pt-32 pb-48 lg:pt-40 lg:pb-56 px-4 sm:px-6 z-10 border-t border-gray-100/50 overflow-hidden">
                <div className="max-w-[1500px] mx-auto relative px-4 md:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 md:mb-32 lg:mb-40 gap-12 xl:gap-20">
                        <div className="relative">
                            <motion.div className="inline-flex items-center gap-4 mb-6 md:mb-8" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                                <span className="w-12 md:w-16 h-[1px] bg-[#00635B] inline-block"></span>
                                <p className="text-[#00635B] tracking-[0.3em] text-[10px] md:text-[11px] font-bold uppercase">Why Stay Ari Tokyo</p>
                            </motion.div>
                            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[1.02] tracking-tighter text-[#111]">
                                매일의 일상이,<br /><span className="text-[#999] italic font-serif">Extraordinary Value</span>
                            </h2>
                        </div>
                        <p className="xl:max-w-md text-[#555] text-lg leading-relaxed border-l-2 border-[#00635B] pl-8 font-medium">우리는 단순히 숙박을 넘어 도쿄의 라이프스타일을 수놓습니다. STAY ARI TOKYO와 함께 가장 완벽하게 정제된 최상의 컨디션을 재창조하세요.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
                        {[
                            { num: '01', highlight: '디테일에 대한 긍지', title: 'Pride in Precision', desc: '티끌 하나 없는 완벽한 공간을 완성하는 자부심. 우리가 준비한 섬세한 컨디션은 게스트의 감동이 됩니다.', imgUrl: heroBgImg, mt: '' },
                            { num: '02', highlight: '세계와 소통하는 접점', title: 'Global Standard', desc: '도쿄를 찾는 수많은 이들의 가장 사적인 휴식 공간을 책임지며, 하이엔드 호스피탈리티를 체득합니다.', imgUrl: placeholderImg2, mt: 'lg:mt-32' },
                            { num: '03', highlight: '혁신적 업무 플랫폼', title: 'Smart & Flexible', desc: '모바일에 최적화된 업무와 직관적인 매뉴얼. 비효율을 버리고 본질적인 가치 향상에 집중합니다.', imgUrl: placeholderImg3, mt: 'lg:mt-64' },
                        ].map((item, i) => (
                            <motion.div key={i} className={`group relative flex flex-col ${item.mt}`} initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="relative w-full aspect-[4/5] rounded-[10rem] overflow-hidden mb-10 shadow-lg group-hover:-translate-y-4 transition-transform duration-700">
                                    <img src={item.imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                                </div>
                                <div className="px-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-[#00635B]"></span>
                                        <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">{item.highlight}</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 font-serif">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Premium Rooms Gallery (Mobile & PC Split) ═══ */}
            <section className="anim block md:hidden w-full px-6 py-20 bg-[#ffffff] text-center">
                <div className="mb-14">
                    <p className="text-[#00635B] tracking-widest text-[11px] font-bold">STAY ARI TOKYO ROOMS</p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#111] leading-tight mb-2 font-serif italic">Curated Spaces</h2>
                    <p className="text-[#888] text-[13px]">특별한 도쿄의 일상을 경험해보세요.</p>
                </div>
                <div className="flex flex-col gap-12 max-w-[420px] mx-auto">
                    {rooms.map((r, i) => (
                        <div key={i} className="group cursor-pointer text-left flex flex-col items-center" onClick={() => r.link && window.open(r.link, '_blank')}>
                            <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden mb-5 bg-[#f8f9fa] shadow-sm">
                                <img src={r.src} alt={r.name} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="w-full flex items-end justify-between border-b border-gray-100 pb-4">
                                <h3 className="text-2xl font-bold font-serif">{r.name}</h3>
                                <span className="text-[#111] opacity-50 text-xl font-light">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="hidden md:block w-full px-8 lg:px-20 py-32 lg:py-48 bg-[#f8f9fa] relative overflow-hidden">
                <div className="max-w-[1600px] mx-auto relative z-10">
                    <div className="mb-32 flex justify-between items-end border-b border-gray-200 pb-12">
                        <div>
                            <p className="text-[#00635B] tracking-[0.3em] text-[12px] font-bold uppercase mb-8">STAY ARI TOKYO ROOMS</p>
                            <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#111] font-serif">Curated Spaces <span className="text-[#888] italic">for Your Taste.</span></h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-20 gap-y-40">
                        {rooms.map((r, i) => (
                            <motion.div key={i} className={`group cursor-pointer flex flex-col relative w-full ${i % 3 === 1 ? 'xl:mt-48' : i % 3 === 2 ? 'xl:mt-24' : ''}`} initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onClick={() => r.link && window.open(r.link, '_blank')}>
                                <div className="relative w-full aspect-[4/5.2] rounded-[1.5rem] overflow-hidden mb-10 shadow-lg group-hover:shadow-2xl transition-all duration-700">
                                    <img src={r.src} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                                </div>
                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <h3 className="text-3xl font-extrabold font-serif group-hover:italic transition-all">{r.name}</h3>
                                        <p className="text-[10px] font-bold text-[#888] tracking-[0.2em] mt-2 uppercase">Tokyo, Japan</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#111] group-hover:text-white transition-all duration-500 shadow-sm"><ArrowUpRight className="w-6 h-6" /></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA SECTION ═══ */}
            <section className="anim w-full px-6 py-28 bg-[#fdfdfd] flex flex-col items-center text-center">
                <div className="max-w-xl">
                    <h2 className="text-[2rem] md:text-[3rem] font-extrabold text-[#212322] leading-tight mb-6">Stay Ari Tokyo와 함께<br />새로운 도약을 시작하세요.</h2>
                    <p className="text-[#666] mb-10 font-medium">우리는 단순한 숙박을 넘어 여행자의 삶에 영감을 주는 공간을 만듭니다.<br />당신의 열정으로 특별한 공간을 완성해주세요.</p>
                </div>
            </section>

            {/* ─── Ultra-Premium Footer ─── */}
            <footer className="w-full pt-20 md:pt-32 pb-12 md:pb-16 px-6 md:px-16 bg-white border-t border-gray-100 relative overflow-hidden">
                <div className="absolute top-10 right-10 md:right-40 text-[7rem] md:text-[14rem] font-black text-[#f8f9fa] select-none pointer-events-none tracking-tighter italic whitespace-nowrap opacity-80">STAY ARI TOKYO</div>
                <div className="max-w-[1600px] mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                        <div className="lg:col-span-4 space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[24px] font-black text-[#212322] tracking-widest font-serif uppercase">Stay Ari Tokyo</span>
                                <span className="w-8 h-[1px] bg-[#212322]/20"></span>
                                <span className="text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">Tokyo Luxury</span>
                            </div>
                            <p className="text-[16px] md:text-[18px] text-[#212322] font-semibold leading-relaxed font-serif italic mb-8 max-w-sm mx-auto lg:mx-0">"We curate not just rooms, but the very essence of Tokyo's sophisticated lifestyle."</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center lg:justify-start gap-3 text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Live in Tokyo: {tokyoTime} JST
                                </div>
                                <p className="text-[12px] text-[#666] leading-relaxed">Tokyo Shinjuku City, Sumiyoshicho 2-10<br />162-0065, Japan</p>
                            </div>
                        </div>
                        <div className="lg:col-span-5 grid grid-cols-2 gap-10 text-center lg:text-left">
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-extrabold tracking-[0.3em] text-[#212322] uppercase opacity-40">Resources</h4>
                                <ul className="space-y-4">
                                    {['Notice', 'FAQ', 'Company'].map((item) => (
                                        <li key={item}><button onClick={() => navigate(`/${item.toLowerCase()}`)} className="text-[14px] font-semibold text-[#555] hover:text-[#212322] transition-colors">{item}</button></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-extrabold tracking-[0.3em] text-[#212322] uppercase opacity-40">Legal</h4>
                                <ul className="space-y-4">
                                    {['Terms', 'Privacy', 'Admin'].map((item) => (
                                        <li key={item}><button onClick={() => navigate(`/${item.toLowerCase()}`)} className="text-[14px] font-semibold text-[#555] hover:text-[#212322] transition-colors">{item}</button></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="lg:col-span-3 flex flex-col justify-between items-center lg:items-end">
                            <a href="https://www.instagram.com/tokyo_stayari/" target="_blank" rel="noopener noreferrer" className="group p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 w-full text-center lg:text-right">
                                <div className="flex items-center justify-center lg:justify-between mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                                    </div>
                                    <div className="hidden lg:flex w-8 h-8 rounded-full border border-gray-100 items-center justify-center text-gray-300 group-hover:text-[#212322] group-hover:border-[#212322] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </div>
                                </div>
                                <p className="text-[15px] font-bold text-[#212322]">@tokyo_stayari</p>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 print:hidden">
                <div className={`w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] sm:h-[650px] max-w-[400px] mb-2 transition-all duration-300 origin-bottom-right ${isInquiryOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
                    {roomId ? <ChatWindow roomId={roomId} applicantName={applicantName} onClose={() => setIsInquiryOpen(false)} /> : <InquiryForm onSubmit={handleInquirySubmit} onClose={() => setIsInquiryOpen(false)} />}
                </div>
                <button onClick={() => setIsInquiryOpen(!isInquiryOpen)} className="w-14 h-14 bg-[#111] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 group relative">
                    {isInquiryOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                    {!isInquiryOpen && <span className="absolute right-full mr-4 bg-white text-[#111] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">담당자와 실시간 상담</span>}
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
