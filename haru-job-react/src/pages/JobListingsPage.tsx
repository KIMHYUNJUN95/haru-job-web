import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Banknote, ChevronRight } from 'lucide-react';

interface JobPosting {
    id: string;
    title: string;
    location: string;
    salary: string;
    startTime: string;
    type: string;
    tags: string[];
    description: string;
    tasks: string[];
    active: boolean;
}

const jobPostings: JobPosting[] = [
    {
        id: 'cleaning-staff',
        title: '객실 클리닝 스태프',
        location: '東京都 新宿区 (건물별 상이)',
        salary: '¥1,250 ~ ¥1,700 / 시간',
        startTime: '오전 9:45',
        type: '아르바이트',
        tags: ['숙박업', '클리닝', '신주쿠'],
        description: '신주쿠 지역 내 ARIA TOKYO 숙박 시설의 객실 클리닝 및 건물 관리 업무를 담당할 스태프를 모집합니다.',
        tasks: [
            '객실 클리닝 (메인 업무)',
            '비품 관리 및 재고 파악',
            '건물 관리',
            '린넨 관리',
            '고객 응대',
        ],
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
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Aria Tokyo</span>
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
                                        <Clock className="w-4 h-4 text-gray-400" /> 시작 {job.startTime}
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
