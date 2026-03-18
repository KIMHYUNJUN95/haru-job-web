import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface FaqItem {
    q: string;
    a: string;
}

interface FaqCategory {
    icon: string;
    title: string;
    items: FaqItem[];
}

const faqData: FaqCategory[] = [
    {
        icon: '🏢',
        title: '지원 및 채용',
        items: [
            {
                q: '나이 제한이 있나요?',
                a: '아니요, 정해진 나이 제한은 없습니다. 현재 현장에서 20대부터 50대까지 다양한 연령층의 분들이 근무하고 계십니다.'
            },
            {
                q: '외국인도 지원 가능한가요?',
                a: '비자를 소지하고 계시고, 비자에 문제만 없다면 지원 가능합니다.'
            },
            {
                q: '일본어 실력 제한이 있나요?',
                a: '아니요, 제한은 없습니다. 일본어를 잘 못하셔도 업무 수행에는 충분히 가능하십니다.'
            },
            {
                q: '비자 기간이 짧은데 근무 가능한가요?',
                a: '죄송합니다. 비자 기간이 3개월 미만으로 짧으신 분은 지원을 삼가 부탁드립니다.'
            },
            {
                q: '면접은 어떤 방식으로 진행되나요?',
                a: '사무실에서 대면으로 면접을 진행합니다.'
            },
            {
                q: '지원 후 결과는 언제 받을 수 있나요?',
                a: '보통 3일 이내에 연락드립니다. 다만, 채용 불가 판정 시에는 별도의 연락을 드리고 있지 않는 점 양해 부탁드립니다.'
            },
            {
                q: '견습 기간은 어느 정도인가요?',
                a: '견습 기간은 40시간 기준으로 진행됩니다. 견습 기간 동안은 현장 매니저와 함께 2인 1조로 업무를 익히게 되며, 40시간 이후부터는 단독으로 근무하시게 됩니다. (특정 건물은 2인 1조가 기본인 경우도 있습니다.)'
            },
        ]
    },
    {
        icon: '⏰',
        title: '근무 시간 및 시프트',
        items: [
            {
                q: '출근 시간은 어떻게 되나요?',
                a: '정해진 출근 시간은 오전 9시 45분입니다. 다만, 사정이 있어 출근이 늦어질 경우에는 미리 담당자에게 연락 부탁드립니다.'
            },
            {
                q: '출근은 어디로 하나요?',
                a: '근무를 배정받으신 건물로 직접 출근하시면 됩니다.'
            },
            {
                q: '1일 평균 근무 시간은 얼마나 되나요?',
                a: '배정된 건물과 객실에 따라 상이하며, 평균 5시간 이상입니다.'
            },
            {
                q: '주말 및 공휴일 근무가 있나요?',
                a: '네, 호텔 업무 특성상 주말 및 공휴일에도 시프트가 배정될 수 있습니다.'
            },
            {
                q: '야간 근무가 있나요?',
                a: '아니요, 야간 근무는 없습니다.'
            },
            {
                q: '휴게시간은 언제인가요?',
                a: '정해진 휴게시간은 없습니다. 본인 상황에 맞춰 유동적으로 휴게시간을 가지시면 됩니다. 자세한 사항은 담당자에게 문의 부탁드립니다.'
            },
            {
                q: '시프트 신청은 언제 하나요?',
                a: '시프트 신청은 매월 말에 다음 달 1개월 단위로 접수받고 있습니다. 다만, 호텔 업무 특성상 매일 예약이 들어오므로 시프트는 수시로 추가되거나 변동될 수 있는 점 참고 부탁드립니다. 본인의 시프트 일정을 매일 확인해 주세요.'
            },
        ]
    },
    {
        icon: '🧹',
        title: '업무 내용',
        items: [
            {
                q: '업무 내용이 어떻게 되나요?',
                a: '기본적인 객실 클리닝 업무가 메인이며, 그 외 건물 관리, 비품 관리, 린넨 관리 등의 업무가 추가될 수 있는 점 참고 부탁드립니다.'
            },
            {
                q: '체크인·체크아웃 시간은 어떻게 되나요?',
                a: '체크인은 오후 4시로 고정이며, 체크아웃은 기본 오전 10시입니다. 다만, 건물별·객실별 상황에 따라 고객님의 레이트 체크아웃이 발생할 수 있습니다. (1~3시간 정도)'
            },
            {
                q: '청소 시간 제한이 있나요?',
                a: '네, 건물별·객실별로 청소 시간 제한이 있습니다. 자세한 사항은 입사 시 안내서를 제공해 드리며, 해당 안내서를 참고 부탁드립니다.'
            },
            {
                q: '배정된 근무지로 이동 시 준비해야 할 것이 있나요?',
                a: '별도로 준비하실 것은 없습니다. 모든 비품은 해당 건물에서 관리 중이며, 건물 내 비품을 사용하시면 됩니다.'
            },
            {
                q: '건물 간 이동이 있나요?',
                a: '상황에 따라 다른 건물로 배정될 수 있습니다.'
            },
        ]
    },
    {
        icon: '💰',
        title: '급여 및 복지',
        items: [
            {
                q: '급여일은 언제인가요?',
                a: '매월 10일입니다. 다만 해당일이 공휴일일 경우, 그 전 평일에 지급됩니다.'
            },
            {
                q: '급여는 얼마인가요?',
                a: '자세한 사항은 담당자에게 문의 부탁드립니다.'
            },
            {
                q: '교통비는 지원되나요?',
                a: '월 최대 3만 엔까지 지원 가능합니다. 매일 교통비 영수증 내역 또는 캡처 화면을 보관하신 후, 매월 말에 담당자에게 제출 부탁드립니다.'
            },
        ]
    },
    {
        icon: '📌',
        title: '기타 안내',
        items: [
            {
                q: '복장은 자유인가요?',
                a: '현장에서 유니폼(상의)을 지급합니다. 하의 또한 자유롭게 착용 가능합니다.'
            },
            {
                q: '주차가 가능한가요?',
                a: '고객 이외의 주차는 불가한 점 참고 부탁드립니다.'
            },
            {
                q: '급한 일정이 생겼을 때는 어떻게 해야 하나요?',
                a: '최대한 빨리 담당자에게 연락 부탁드립니다. 일정 변경으로 인해 근무 조정이 필요한 경우에는 최소 2일 전까지 연락을 받고 있습니다.'
            },
            {
                q: '담당자 연락은 어떻게 하나요?',
                a: '모든 업무 관련 연락은 카카오톡으로 진행하고 있습니다.'
            },
        ]
    },
];

const FaqAccordion = ({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) => {
    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 px-1 text-left group"
            >
                <span className={`font-semibold text-[15px] transition-colors ${isOpen ? 'text-[#111]' : 'text-[#333] group-hover:text-[#111]'}`}>
                    {item.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <p className="text-[14px] text-gray-600 leading-relaxed px-1 font-medium">
                    {item.a}
                </p>
            </div>
        </div>
    );
};

const FaqPage = () => {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#f8f8f6] font-sans">
            {/* 상단 네비 */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> 돌아가기
                    </button>
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Stay Ari Tokyo</span>
                    <div className="w-20" />
                </div>
            </nav>

            {/* 본문 */}
            <div className="pt-28 pb-20 px-6 max-w-[900px] mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111] tracking-tight mb-3">자주 묻는 질문</h1>
                <p className="text-gray-500 font-medium mb-12 text-sm">STAY ARI TOKYO 지원에 관한 궁금한 점을 확인하세요.</p>

                <div className="space-y-8">
                    {faqData.map((cat, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="px-7 pt-7 pb-2">
                                <h2 className="text-lg font-extrabold text-[#111] flex items-center gap-2.5 tracking-tight">
                                    <span className="text-xl">{cat.icon}</span> {cat.title}
                                </h2>
                            </div>
                            <div className="px-7 pb-3">
                                {cat.items.map((item, j) => {
                                    const id = `${i}-${j}`;
                                    return (
                                        <FaqAccordion
                                            key={j}
                                            item={item}
                                            isOpen={openId === id}
                                            onToggle={() => setOpenId(openId === id ? null : id)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center text-sm text-gray-400 font-medium">
                    <p>추가 문의 사항이 있으시면 담당자에게 카카오톡으로 연락해 주세요.</p>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
