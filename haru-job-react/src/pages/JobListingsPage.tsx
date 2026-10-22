import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Banknote, ChevronRight } from 'lucide-react';

/* eslint-disable react-refresh/only-export-components */

interface JobPosting {
    id: string;
    title: string;
    location: string;
    salary: string;
    workTime: string;
    type: string;
    tags: string[];
    description: string;
    tasks: string[];
    requirements: string[];
    workStyle: string[];
    locationDetails: string[];
    benefits: string[];
    companyInfo: string[];
    employmentType: 'part-time' | 'full-time';
    applicationPositions?: string[];
    visaSupport?: string[];
    applicationInfo?: string[];
    companyWebsite?: string;
    active: boolean;
}

const jobPostings: JobPosting[] = [
    {
        id: 'cleaning-staff',
        title: '객실 클리닝 스태프',
        location: '신오쿠보 · 타카다노바바 · 아라키초 역세권',
        salary: '¥1,350 시작 · 연수 후 ¥1,500~¥2,200',
        workTime: '09:45 ~ 17:45',
        type: '아르바이트',
        tags: ['클리닝', '역세권', '초보 가능'],
        description: '신주쿠 지역 아파트먼트 호텔 STAY ARI에서 객실 클리닝 업무를 함께할 스태프를 모집합니다. 연수 후 시급 인상 구조와 안정적인 팀 운영이 강점입니다.',
        tasks: [
            '객실 클리닝 (메인 업무)',
            '비품 관리 및 재고 파악',
            '건물 관리',
            '린넨 관리',
        ],
        requirements: [
            '아르바이트 10명 모집 (채용 시 조기 마감)',
            '20세~60세 지원 가능',
            '스마트폰 업무 앱 사용 가능자 우대',
            '청소 경력자 우대',
            '책임감 있고 꼼꼼한 분 환영',
        ],
        workStyle: [
            '주 2~5일 근무 (일정 및 요일 협의 가능)',
            '금·토·일·월 근무 가능자 우대',
            '하루 3~8시간 협의 가능',
            '연장근무 시 1분 단위 초과근무수당 지급',
        ],
        locationDetails: [
            '아라키초: 아케보노바시역 도보 3분',
            '가부키초·오오쿠보: 히가시신주쿠역 도보 5분',
            '가부키초·오오쿠보: 신오쿠보역 도보 8분',
            '가부키초·오오쿠보: 세이부신주쿠역 도보 10분',
            '타카다노바바역 도보 10분',
        ],
        benefits: [
            '시급 1,350엔부터 시작',
            '연수(1~3개월) 종료 후 시급 1,500엔',
            '업무 능력에 따라 최대 시급 2,200엔',
            '특정 지정일 근무 시 시급 +100~300엔 추가 지급',
            '교통비 월 최대 15,000엔 지급',
        ],
        companyInfo: [
            '신주쿠 지역 아파트먼트 호텔 전문 운영',
            '직원 및 아르바이트 40명 이상 근무',
            '900㎡ 규모 신규 호텔 오픈 예정',
            '지속적으로 성장 중인 운영사',
        ],
        employmentType: 'part-time',
        active: true,
    },
    {
        id: 'full-time-staff',
        title: 'STAY ARI 사무직·현장직 정사원',
        location: '아케보노바시역 도보 1분 · 신주쿠구 내',
        salary: '월 ¥240,000~ (경력직 협의)',
        workTime: '09:00 ~ 18:00',
        type: '정사원',
        tags: ['비자 지원', '주 5일', '상여금'],
        description: '사업 확장과 신규 호텔 오픈에 따라 STAY ARI와 함께 성장할 정사원을 모집합니다. 사무직과 현장직에서 장기적으로 안정적인 근무를 희망하는 분을 기다립니다.',
        tasks: [
            '운영 매니저: 사이트 관리, 사무 서류 정리, 아르바이트 근태 관리 및 현장 지원',
            '브랜딩·마케팅 담당자: Instagram, Threads, YouTube 등 SNS 운영',
            '클리닝 매니저: 점포별 클리닝, 현장 운영 및 아르바이트 관리',
        ],
        requirements: [
            '정사원 5명 모집 (채용 시 조기 마감)',
            '20세~60세 지원 가능',
            '일본어 N2 이상 필수, 영어 가능자 우대',
            '현재 일본에 거주하며 유효한 재류자격을 보유한 분',
            '관광비자 또는 현재 한국 거주자는 지원이 어렵습니다',
        ],
        workStyle: [
            '6개월 연수 후 정직원 전환',
            '주 5일 근무',
            '토·일·공휴일 휴무',
            '09:00~18:00 근무 (휴게시간 1시간 포함)',
        ],
        locationDetails: [
            '사무직: 아케보노바시역 도보 1분',
            '현장직: 신주쿠구 내 면담 후 배정',
        ],
        benefits: [
            '월 급여 240,000엔부터 (경력직 협의)',
            '4대 보험 가입',
            '연 1~2회 상여금 지급',
            '입사 6개월 후 연차 10일 지급 (이후 매년 1일 증가)',
            '생일 상품권 지급',
            '교통비 월 최대 15,000엔 지급',
            '유니폼 지급',
        ],
        companyInfo: [
            '신주쿠 지역 아파트먼트 호텔 전문 운영',
            '약 400명 수용 가능한 숙박시설 운영',
            '직원 및 아르바이트 40명 이상 근무',
            '신오쿠보 지역 900㎡ 규모 신규 호텔 오픈 예정',
        ],
        employmentType: 'full-time',
        applicationPositions: ['운영 매니저', '브랜딩·마케팅 담당자', '클리닝 매니저'],
        visaSupport: [
            '비자 만료일까지 6개월 이상 남아 있고 비자 결격사유가 없는 분',
            '연수 종료 후 정직원 전환 시 비자 발급 지원',
            '지원 가능 비자: 인문지식·국제업무, 특정기능',
        ],
        applicationInfo: [
            '사진이 첨부된 이력서 필수',
            '현재 재류자격 및 남은 기간 기재',
            '입사 가능일 기재',
            '본인이 자신 있는 업무 기재',
        ],
        companyWebsite: 'https://haru-stay.com/ko',
        active: true,
    },
    // 추후 채용 공고 추가 시 여기에 추가
];

const JobListingsPage = () => {
    const navigate = useNavigate();
    const activeJobs = jobPostings.filter(j => j.active);

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
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111] tracking-tight mb-3">채용공고</h1>
                <p className="text-gray-500 font-medium mb-4 text-sm">현재 모집 중인 포지션을 확인하고 지원하세요.</p>
                <div className="flex items-center gap-2 mb-12">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {activeJobs.length}개 포지션 모집 중
                    </span>
                </div>

                {/* 공고 목록 */}
                <div className="space-y-5">
                    {activeJobs.map(job => (
                        <div
                            key={job.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 cursor-pointer group"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                            {/* 카드 상단 */}
                            <div className="p-7 md:p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">{job.type}</span>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111] mt-3 tracking-tight group-hover:text-blue-700 transition-colors">{job.title}</h2>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all mt-6 shrink-0" />
                                </div>

                                <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">{job.description}</p>

                                {/* 정보 뱃지 */}
                                <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-[13px] text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Banknote className="w-4 h-4 text-gray-400" /> {job.salary}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-gray-400" /> {job.workTime}
                                    </span>
                                </div>
                            </div>

                            {/* 카드 하단 태그 */}
                            <div className="px-7 md:px-8 py-4 bg-gray-50/80 border-t border-gray-50 flex flex-wrap gap-2">
                                {job.tags.map((tag, i) => (
                                    <span key={i} className="text-[11px] font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-100">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {activeJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                            <span className="text-3xl">📋</span>
                        </div>
                        <p className="text-xl font-bold text-[#111] mb-2">현재 모집 중인 공고가 없습니다</p>
                        <p className="text-gray-400 text-sm font-medium">새로운 공고가 등록되면 업데이트됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListingsPage;
export { jobPostings };
export type { JobPosting };
