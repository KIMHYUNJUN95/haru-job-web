import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, Trash2, Mail, Phone, Calendar, Clock, Printer, FileDown, X } from 'lucide-react';

export interface Applicant {
    id: string;
    name?: string;
    age?: string | number;
    gender?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appliedAt?: any;
    exp_hotel?: string;
    duration?: string;
    nationality?: string;
    phone?: string;
    kakao_id?: string;
    address?: string;
    commute_time?: string;
    uniform_size?: string;
    has_industry_exp?: string;
    industry_tasks?: string[];
    resumeUrl?: string; // 첨부된 이력서 URL
    days?: string | string[];
    days_per_week?: string;
    start_date?: string;
    total_career?: string;
    visa_type?: string;
}

const AdminPage = () => {
    const navigate = useNavigate();

    // 간편 로그인 상수
    const ADMIN_PASSWORD = '9595';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

    // 로그인 된 경우에만 지원자 목록 가져오기
    useEffect(() => {
        if (!isAuthenticated) return;

        const q = query(collection(db, 'applicants'), orderBy('appliedAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Applicant, 'id'>) }));
            setApplicants(data);
        });
        return () => unsub();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('비밀번호가 일치하지 않습니다.');
            setPasswordInput('');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPasswordInput('');
        setSelectedApplicant(null);
        setIsMobileDetailOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('정말로 이 지원자를 삭제하시겠습니까?')) {
            await deleteDoc(doc(db, 'applicants', id));
            if (selectedApplicant?.id === id) {
                setSelectedApplicant(null);
                setIsMobileDetailOpen(false);
            }
        }
    };

    // --- Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[url('/images/hero.jpg')] bg-cover bg-center flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-[#121214]/80 backdrop-blur-md" />
                <div className="glass-panel p-10 rounded-3xl w-full max-w-sm relative z-10 text-center shadow-2xl border border-white/10">
                    <h1 className="font-serif text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-[#D4AF37] mb-8 text-sm">관리자 비밀번호를 입력해주세요</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="****"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            required
                            autoFocus
                            maxLength={4}
                            className="w-full bg-[#1A1A1E] text-center tracking-[1em] text-2xl border border-[#2A2A30] text-white rounded-xl px-4 py-4 focus:border-[#D4AF37] outline-none transition-colors"
                        />

                        <div className="h-6">
                            {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}
                        </div>

                        <button className="w-full bg-[#111] hover:bg-[#D4AF37] text-white hover:text-black border border-[#333] hover:border-[#D4AF37] font-bold py-4 rounded-xl mt-2 transition-all active:scale-95 duration-300">
                            접속하기
                        </button>
                    </form>
                    <button onClick={() => navigate('/')} className="mt-8 text-gray-500 text-sm hover:text-white transition-colors underline-offset-4 hover:underline">돌아가기</button>
                </div>
            </div>
        );
    }

    // --- Dashboard Screen ---
    return (
        <div className="h-screen bg-[#121214] flex overflow-hidden text-white font-sans print:bg-white print:text-black print:h-auto print:overflow-visible">

            {/* Sidebar: Applicant List (데스크탑은 고정, 모바일은 상세가 안 열려있을 때만 표시) */}
            <div className={`w-full md:w-[400px] border-r border-[#2A2A30] flex-col bg-[#161619] shadow-2xl z-20 print:hidden ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-[#2A2A30] flex justify-between items-center bg-[#1C1C20]">
                    <div>
                        <h2 className="font-serif text-2xl font-bold">지원자 목록</h2>
                        <p className="text-[#D4AF37] text-sm mt-1">{applicants.length}명 대기 중</p>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors p-2" title="로그아웃">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 print:hidden">
                    {applicants.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">새로운 지원자가 없습니다.</div>
                    ) : (
                        applicants.map(app => {
                            const appliedAt = app.appliedAt instanceof Timestamp ? app.appliedAt.toDate().toLocaleDateString() : '';
                            return (
                                <div
                                    key={app.id}
                                    onClick={() => {
                                        setSelectedApplicant(app);
                                        setIsMobileDetailOpen(true);
                                    }}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedApplicant?.id === app.id ? 'bg-[#2A2A30] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-[#1C1C20] border-transparent hover:border-[#3A3A40]'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {app.name}
                                            <span className="text-xs font-normal text-gray-400 bg-[#121214] px-2 py-1 rounded-full">{app.age}세 · {app.gender}</span>
                                        </h3>
                                        <span className="text-xs text-gray-500">{appliedAt}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(app.has_industry_exp === '있음' || app.exp_hotel === '유') && <span className="text-[10px] bg-[#8B5E3C]/20 text-[#D4AF37] border border-[#8B5E3C]/40 px-2 py-1 rounded-md">경력있음</span>}
                                        {app.resumeUrl && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-1 rounded-md">이력서 첨부</span>}
                                        <span className="text-[10px] bg-[#2A2A30] text-gray-300 px-2 py-1 rounded-md">{app.duration || '기간미정'}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Content: Resume Detail */}
            <div className={`flex-1 flex-col bg-[url('/images/interior_room.jpg')] bg-cover relative print:bg-none print:bg-white print:block ${isMobileDetailOpen ? 'flex absolute inset-0 z-50 md:relative' : 'hidden md:flex'}`}>
                <div className="absolute inset-0 bg-[#121214]/90 backdrop-blur-xl print:hidden" />

                {selectedApplicant ? (
                    <div className="relative z-10 p-4 md:p-10 h-full overflow-y-auto w-full flex justify-center print:p-0 print:overflow-visible">
                        <div className="w-full max-w-3xl glass-panel p-8 md:p-12 rounded-3xl md:shadow-2xl h-max mb-10 border-t border-l border-white/5 print:bg-transparent print:border-none print:shadow-none print:p-0 print:text-black print:mb-0">

                            {/* 모바일에서 목록으로 돌아가는 닫기 버튼 */}
                            <button
                                onClick={() => setIsMobileDetailOpen(false)}
                                className="md:hidden absolute top-4 right-4 p-3 bg-black/40 text-white rounded-full backdrop-blur-md active:scale-95 print:hidden"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-[#2A2A30] print:border-[#ddd] pb-8 pt-8 md:pt-0 gap-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 print:text-black">{selectedApplicant.name}</h1>
                                    <p className="text-gray-400 print:text-gray-600 text-lg">{selectedApplicant.age}세 / {selectedApplicant.gender} / {selectedApplicant.nationality || '대한민국'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 print:hidden w-full md:w-auto">
                                    <button onClick={() => window.print()} className="flex-1 md:flex-none justify-center bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 px-4 py-3 md:py-2 rounded-xl text-sm font-semibold transition-colors active:scale-95">
                                        <Printer className="w-5 h-5 md:w-4 md:h-4" /> <span className="inline">인쇄</span>
                                    </button>
                                    <button onClick={() => handleDelete(selectedApplicant.id)} className="flex-1 md:flex-none justify-center text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-3 md:py-2 rounded-xl text-sm font-semibold hover:bg-red-400/10 transition-colors active:scale-95">
                                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" /> <span className="inline">삭제</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-[#D4AF37] print:text-[#a88214] mb-4 flex items-center gap-2"><Phone className="w-5 h-5" /> 연락처 및 인적</h3>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">휴대폰</span><span className="print:text-black font-medium">{selectedApplicant.phone || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">카카오톡</span><span className="print:text-black font-medium">{selectedApplicant.kakao_id || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">거주지</span><span className="print:text-black font-medium">{selectedApplicant.address || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">출퇴근 소요</span><span className="print:text-black font-medium">{selectedApplicant.commute_time || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">유니폼 사이즈</span><span className="print:text-black font-medium">{selectedApplicant.uniform_size || '-'}</span></div>
                                </div>

                                {/* Work Terms */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-[#D4AF37] print:text-[#a88214] mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> 근무 조건</h3>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">희망 요일</span><span className="print:text-black font-medium">{Array.isArray(selectedApplicant.days) ? selectedApplicant.days.join(', ') : selectedApplicant.days || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">근무 일수</span><span className="print:text-black font-medium">{selectedApplicant.days_per_week || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">희망 기간</span><span className="print:text-black font-medium">{selectedApplicant.duration || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-[#2A2A30] print:border-[#eee] py-2"><span className="text-gray-500 print:text-gray-600 font-semibold w-24 shrink-0">시작 가능일</span><span className="print:text-black font-medium">{selectedApplicant.start_date || '-'}</span></div>
                                </div>

                                {/* Experience */}
                                <div className="md:col-span-2 space-y-4 mt-2">
                                    <h3 className="text-xl font-bold text-[#D4AF37] print:text-[#a88214] mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> 경력 및 추가 역량</h3>
                                    <div className="bg-[#1A1A1E] print:bg-white print:border-[#ddd] p-6 rounded-2xl border border-[#2A2A30] flex flex-col md:flex-row gap-6 md:gap-8">
                                        <div className="flex-1">
                                            <p className="text-gray-500 print:text-gray-600 text-[13px] font-bold mb-1">동일 업종 경험 유무</p>
                                            <p className="font-bold text-lg text-white print:text-black">{selectedApplicant.has_industry_exp || (selectedApplicant.exp_hotel === '유' ? '있음' : '없음')}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 print:text-gray-600 text-[13px] font-bold mb-1">동일 업종 세부 직무</p>
                                            <p className="font-bold text-lg text-[#D4AF37] print:text-[#a88214]">{Array.isArray(selectedApplicant.industry_tasks) && selectedApplicant.industry_tasks.length > 0 ? selectedApplicant.industry_tasks.join(', ') : '-'}</p>
                                        </div>
                                    </div>

                                    {/* 첨부파일 (이력서) */}
                                    {selectedApplicant.resumeUrl && (
                                        <div className="mt-8 print:hidden pt-8 border-t border-[#2A2A30]">
                                            <h3 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2"><FileDown className="w-5 h-5" /> 이력서 및 포트폴리오 첨부</h3>
                                            <a
                                                href={selectedApplicant.resumeUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-3 bg-[#1A1A1E] hover:bg-[#2A2A30] border border-[#3A3A40] text-white px-8 py-5 rounded-2xl transition-all w-full md:w-auto hover:shadow-lg active:scale-95 group"
                                            >
                                                <div className="bg-[#2A2A30] p-2 rounded-full group-hover:scale-110 transition-transform">
                                                    <FileDown className="w-6 h-6 text-[#D4AF37]" />
                                                </div>
                                                <span className="font-bold text-[16px]">첨부 파일 열기 / 다운로드 (새 창)</span>
                                            </a>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex-1 flex items-center justify-center text-gray-500 print:hidden">
                        <div className="text-center">
                            <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">좌측 목록에서 지원자를 선택해주세요.</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminPage;
