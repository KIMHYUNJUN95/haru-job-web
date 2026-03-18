import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface NoticeItem {
    date: string;
    title: string;
    content: string;
    important?: boolean;
}

const noticeData: NoticeItem[] = [
    {
        date: '2026.03.01',
        title: '[안내] ARIA TOKYO 채용 사이트 오픈 및 3월 채용 시작',
        content: `안녕하세요. ARIA TOKYO입니다.

도쿄 신주쿠 지역을 중심으로 럭셔리 숙박 경험을 제공하는 ARIA TOKYO에서
2026년 3월부터 새로운 스태프 채용을 시작합니다.

저희와 함께 전 세계 여행자들에게 쾌적하고 잊지 못할 경험을 선사할
열정적인 분들의 많은 지원을 기다립니다.

자세한 채용 공고는 상단의 '채용공고' 메뉴에서 확인하실 수 있습니다.
감사합니다.`,
        important: true,
    },
    {
        date: '2026.03.01',
        title: '[채용] 객실 클리닝 스태프 모집 안내',
        content: `현재 ARIA TOKYO에서 '객실 클리닝 스태프'를 모집 중입니다.

■ 주요 업무
- 객실 클리닝 (메인 업무)
- 비품 관리 및 재고 파악
- 건물 관리 및 린넨 관리

■ 근무 조건
- 시급: ¥1,250 ~ ¥1,700 (경력 및 업무 능숙도에 따라 차등 지급)
- 근무지: 신주쿠 지역 내 ARIA TOKYO 숙박 시설 (건물별 상이)
- 근무 시작: 오전 9:45

초보자도 환영하며, 나이와 일본어 실력에 제한이 없습니다.
상세 내용 확인 및 지원은 '채용공고' 메뉴를 이용해 주시기 바랍니다.`,
    },
    {
        date: '2026.03.01',
        title: '[필독] 지원서 접수 시 유의사항 안내',
        content: `ARIA TOKYO 채용 지원 시 다음 유의사항을 반드시 확인해 주시기 바랍니다.

1. 비자 요건
- 일본 내 취업 활동이 가능한 비자를 소지해야 합니다.
- 비자 만료일이 '3개월 이상' 남은 분만 지원 가능합니다. 
(3개월 미만인 경우 지원이 불가하오니 양해 부탁드립니다.)

2. 정보 기재
- 이름, 연락처(카카오톡 ID 필수), 비자 종류 및 만료일 등 필수 정보를 정확히 기재해 주세요.
- 허위 사실 기재 시 채용이 취소될 수 있습니다.

3. 면접 및 합격 안내
- 서류 심사 합격자에 한해 개별 연락(카카오톡)을 드리며, 대면 면접을 진행합니다.
- 불합격 처리 시 별도의 통보를 드리지 않는 점 양해 부탁드립니다.`,
        important: true,
    },
];

const NoticeAccordion = ({ item, isOpen, onToggle }: { item: NoticeItem; isOpen: boolean; onToggle: () => void }) => {
    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-start sm:items-center justify-between py-5 px-1 text-left group flex-col sm:flex-row gap-2 sm:gap-4"
            >
                <div className="flex items-center gap-3">
                    {item.important && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100/50 shrink-0">
                            중요
                        </span>
                    )}
                    <span className={`font-semibold text-[15px] sm:text-[16px] transition-colors leading-snug ${isOpen ? 'text-[#111]' : 'text-[#333] group-hover:text-[#111]'}`}>
                        {item.title}
                    </span>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap sm:ml-4">{item.date}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50/50 rounded-xl p-5 mt-2">
                    <p className="text-[14px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {item.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

const NoticePage = () => {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#f8f8f6] font-sans">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> 돌아가기
                    </button>
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Aria Tokyo</span>
                    <div className="w-20" />
                </div>
            </nav>

            <div className="pt-28 pb-20 px-6 max-w-[900px] mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111] tracking-tight mb-3">공지사항</h1>
                <p className="text-gray-500 font-medium mb-12 text-sm">ARIA TOKYO의 주요 채용 및 운영 안내 사항입니다.</p>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="px-5 sm:px-7 py-3">
                        {noticeData.map((item, i) => (
                            <NoticeAccordion
                                key={i}
                                item={item}
                                isOpen={openId === i}
                                onToggle={() => setOpenId(openId === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticePage;
