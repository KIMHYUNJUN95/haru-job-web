import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Banknote, CheckCircle2 } from 'lucide-react';
import { jobPostings } from './JobListingsPage';

const JobDetailPage = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const job = jobPostings.find(j => j.id === jobId);

    if (!job) {
        return (
            <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center font-sans">
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#111] mb-2">공고를 찾을 수 없습니다</p>
                    <button onClick={() => navigate('/jobs')} className="text-blue-600 font-medium text-sm mt-4 hover:underline">채용공고 목록으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f6] font-sans">
            {/* 상단 네비 */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> 채용공고
                    </button>
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Stay Ari Tokyo</span>
                    <div className="w-20" />
                </div>
            </nav>

            {/* 본문 */}
            <div className="pt-28 pb-32 px-6 max-w-[900px] mx-auto">
                {/* 헤더 */}
                <div className="mb-10">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">{job.type}</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#111] tracking-tight mt-4 mb-4">{job.title}</h1>
                    <p className="text-gray-600 text-[15px] leading-relaxed font-medium">{job.description}</p>
                </div>

                {/* 근무 조건 카드 */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mb-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">근무 조건</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[12px] text-gray-400 font-bold mb-1">근무지</p>
                                <p className="text-[14px] text-[#111] font-bold">{job.location}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Banknote className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[12px] text-gray-400 font-bold mb-1">시급</p>
                                <p className="text-[14px] text-[#111] font-bold">{job.salary}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[12px] text-gray-400 font-bold mb-1">근무 시간</p>
                                <p className="text-[14px] text-[#111] font-bold">{job.workTime}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 업무 내용 카드 */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mb-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">주요 업무</h2>
                    <div className="space-y-3.5">
                        {job.tasks.map((task, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-[14px] text-gray-700 font-medium">{task}</span>
                                {job.employmentType === 'part-time' && i === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">메인</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 지원 자격 카드 */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">지원 자격</h2>
                    <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                        {job.requirements.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">근무 형태</h2>
                    <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                        {job.workStyle.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">근무지역</h2>
                    <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                        {job.locationDetails.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">급여 및 복리후생</h2>
                    <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                        {job.benefits.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {job.visaSupport && (
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                        <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">비자 지원</h2>
                        <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                            {job.visaSupport.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {job.applicationInfo && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                        <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">지원 서류</h2>
                        <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                            {job.applicationInfo.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-gray-400">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 md:p-8 mt-6">
                    <h2 className="text-lg font-extrabold text-[#111] mb-6 tracking-tight">회사 소개</h2>
                    <ul className="space-y-3 text-[14px] text-gray-600 font-medium">
                        {job.companyInfo.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                    {job.companyWebsite && (
                        <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex mt-6 text-[14px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            회사 홈페이지에서 객실 및 시설 확인하기
                        </a>
                    )}
                </div>
            </div>

            {/* 하단 고정 지원 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 safe-area-bottom">
                <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-[15px] font-extrabold text-[#111]">{job.title}</p>
                        <p className="text-[12px] text-gray-400 font-medium">{job.salary}</p>
                    </div>
                    <button
                        onClick={() => navigate(`/apply?job=${job.id}`)}
                        className="w-full md:w-auto bg-[#111] hover:bg-[#333] text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 text-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
                    >
                        지원하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
