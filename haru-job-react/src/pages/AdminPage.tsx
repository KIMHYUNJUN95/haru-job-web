import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, Trash2, Mail, Phone, Calendar, Clock, Printer, FileDown, X, MessageSquare, Send } from 'lucide-react';
import { useChat } from '../hooks/useChat';

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
    resumeUrl?: string; // 첨부된 이력서 URL (신규 applications)
    resume_url?: string; // 첨부된 이력서 URL (기존 applicants)
    days?: string | string[];
    days_per_week?: string;
    start_date?: string;
    total_career?: string;
    visa_type?: string;
    visa_period?: string; // 비자 만료일
    source?: string; // 지원 경로
    motivation?: string; // 지원 동기
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
    
    // 채팅 관련 상태
    const [viewMode, setViewMode] = useState<'applications' | 'chats'>('applications');
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [adminInput, setAdminInput] = useState('');
    const { messages: currentChatMessages, sendMessage: sendAdminMessage } = useChat(selectedRoom?.id || null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // 로그인 된 경우에만 지원자 목록 가져오기 (기존 applicants + 신규 applications 두 컬렉션 병합)
    useEffect(() => {
        if (!isAuthenticated) return;

        // 기존 컬렉션 (applicants)
        const q1 = query(collection(db, 'applicants'), orderBy('appliedAt', 'desc'));
        // 신규 컬렉션 (applications)
        const q2 = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));

        let data1: Applicant[] = [];
        let data2: Applicant[] = [];

        const merge = () => {
            const merged = [...data1, ...data2];
            // 최신순 정렬 (appliedAt 또는 createdAt 기준)
            merged.sort((a, b) => {
                const getTime = (item: Applicant) => {
                    const ts = item.appliedAt || (item as any).createdAt;
                    if (ts instanceof Timestamp) return ts.toMillis();
                    return 0;
                };
                return getTime(b) - getTime(a);
            });
            setApplicants(merged);
        };

        const unsub1 = onSnapshot(q1, (snapshot) => {
            data1 = snapshot.docs.map(d => ({ id: d.id, _collection: 'applicants', ...(d.data() as Omit<Applicant, 'id'>) } as Applicant));
            merge();
        });

        const unsub2 = onSnapshot(q2, (snapshot) => {
            data2 = snapshot.docs.map(d => ({ id: d.id, _collection: 'applications', ...(d.data() as Omit<Applicant, 'id'>) } as Applicant));
            merge();
        });

        return () => { unsub1(); unsub2(); };
    }, [isAuthenticated]);

    // 채팅방 목록 가져오기
    useEffect(() => {
        if (!isAuthenticated || viewMode !== 'chats') return;

        const q = query(collection(db, 'chat_rooms'), orderBy('lastMessageTime', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setChatRooms(rooms);
        });

        return () => unsubscribe();
    }, [isAuthenticated, viewMode]);

    // 채팅 스크롤 제어
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [currentChatMessages]);

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
            await deleteDoc(doc(db, 'applications', id));
            if (selectedApplicant?.id === id) {
                setSelectedApplicant(null);
                setIsMobileDetailOpen(false);
            }
        }
    };

    // --- Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 relative">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[100px] pointer-events-none opacity-80" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />

                <div className="bg-white p-10 rounded-[32px] w-full max-w-sm relative z-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
                    <h1 className="font-serif text-3xl font-extrabold text-[#111] mb-2 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 mb-8 text-sm font-medium">관리자 비밀번호를 입력해주세요</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="****"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            required
                            autoFocus
                            maxLength={4}
                            className="w-full bg-[#f9f9f9] text-center tracking-[1em] indent-[0.5em] text-2xl border border-gray-200 text-[#111] rounded-2xl px-4 py-4 focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white outline-none transition-all shadow-sm"
                        />

                        <div className="h-6">
                            {error && <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>}
                        </div>

                        <button className="w-full bg-[#111] hover:bg-[#333] text-white font-bold py-4 rounded-2xl mt-2 transition-all active:scale-95 shadow-md">
                            접속하기
                        </button>
                    </form>
                    <button onClick={() => navigate('/')} className="mt-8 text-gray-400 text-sm hover:text-gray-800 transition-colors hover:underline underline-offset-4">돌아가기</button>
                </div>
            </div>
        );
    }

    // --- Dashboard Screen ---
    return (
        <div className="h-screen bg-[#f3f4f6] flex overflow-hidden text-[#111] font-sans print:bg-white print:text-black print:h-auto print:overflow-visible">

            {/* Sidebar: Applicant List */}
            <div className={`w-full md:w-[420px] border-r border-gray-200 flex-col bg-white shadow-xl z-20 print:hidden ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="font-serif text-[1.5rem] font-extrabold tracking-tight">Admin Portal</h2>
                        <div className="flex gap-4 mt-2">
                            <button 
                                onClick={() => setViewMode('applications')} 
                                className={`text-sm font-bold pb-1 border-b-2 transition-all ${viewMode === 'applications' ? 'text-[#111] border-[#111]' : 'text-gray-400 border-transparent'}`}
                            >
                                지원서 ({applicants.length})
                            </button>
                            <button 
                                onClick={() => setViewMode('chats')} 
                                className={`text-sm font-bold pb-1 border-b-2 transition-all ${viewMode === 'chats' ? 'text-[#111] border-[#111]' : 'text-gray-400 border-transparent'}`}
                            >
                                실시간 문의 ({chatRooms.length})
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100" title="로그아웃">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 print:hidden bg-gray-50/30">
                    {viewMode === 'applications' ? (
                        /* 기존 지원자 목록 */
                        applicants.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-medium">새로운 지원자가 없습니다.</div>
                        ) : (
                            applicants.map(app => {
                                const appliedAt = app.appliedAt instanceof Timestamp ? app.appliedAt.toDate().toLocaleDateString() : (app as any).createdAt instanceof Timestamp ? (app as any).createdAt.toDate().toLocaleDateString() : '';
                                return (
                                    <div
                                        key={app.id}
                                        onClick={() => {
                                            setSelectedApplicant(app);
                                            setSelectedRoom(null);
                                            setIsMobileDetailOpen(true);
                                        }}
                                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedApplicant?.id === app.id ? 'bg-white border-[#111] shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:border-gray-200 hover:bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-extrabold text-[#111] text-lg flex items-center gap-2">
                                                {app.name}
                                                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{app.age}세 · {app.gender}</span>
                                            </h3>
                                            <span className="text-xs text-gray-400 font-medium">{appliedAt}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(app.has_industry_exp === '있음' || app.exp_hotel === '유') && <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100/50">동종경력</span>}
                                            {(app.resumeUrl || app.resume_url) && <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100/50">이력서 첨부</span>}
                                            <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{app.duration || '기간미정'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        /* 채팅 목록 */
                        chatRooms.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-medium">진행 중인 문의가 없습니다.</div>
                        ) : (
                            chatRooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setSelectedApplicant(null);
                                        setIsMobileDetailOpen(true);
                                    }}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedRoom?.id === room.id ? 'bg-white border-[#111] shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:border-gray-200 hover:bg-white'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-extrabold text-[#111]">{room.name}</h3>
                                        <span className="text-[10px] text-gray-400">{room.lastMessageTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                                    <div className="mt-2 flex gap-1">
                                        <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{room.age}세 · {room.gender}</span>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Main Content: Resume Detail */}
            <div className={`flex-1 flex-col relative print:bg-none print:bg-white print:block ${isMobileDetailOpen ? 'flex absolute inset-0 z-50 md:relative' : 'hidden md:flex'}`}>

                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[100px] pointer-events-none opacity-80" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />

                {selectedApplicant ? (
                    /* 기존 지원서 상세보기 */
                    <div className="relative z-10 p-4 md:p-10 h-full overflow-y-auto w-full flex justify-center print:p-0 print:overflow-visible">
                        <div className="w-full max-w-4xl bg-white p-8 md:p-14 rounded-[32px] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 h-max mb-10 print:bg-transparent print:border-none print:shadow-none print:p-0 print:text-black print:mb-0">

                            {/* 모바일 닫기 버튼 */}
                            <button
                                onClick={() => setIsMobileDetailOpen(false)}
                                className="md:hidden absolute top-6 right-6 p-2.5 bg-gray-100 text-gray-600 rounded-full active:scale-95 print:hidden border border-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* 헤더 섹션 */}
                            <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-gray-100 print:border-[#ddd] pb-8 pt-8 md:pt-0 gap-6">
                                <div>
                                    <h1 className="text-[2rem] md:text-[2.5rem] font-extrabold mb-3 text-[#111] tracking-tight print:text-black">{selectedApplicant.name}</h1>
                                    <p className="text-gray-500 font-bold text-lg flex gap-3 items-center">
                                        <span>{selectedApplicant.age}세</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{selectedApplicant.gender}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{selectedApplicant.nationality || '대한민국'}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 print:hidden w-full md:w-auto mt-4 md:mt-0">
                                    <button onClick={() => window.print()} className="flex-1 md:flex-none justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 flex items-center gap-2 px-5 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border border-gray-200">
                                        <Printer className="w-5 h-5 md:w-4 md:h-4" /> <span className="inline">인쇄</span>
                                    </button>
                                    <button onClick={() => handleDelete(selectedApplicant.id)} className="flex-1 md:flex-none justify-center text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2 px-5 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border border-red-100">
                                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" /> <span className="inline">삭제</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                {/* 연락처 및 인적 */}
                                <div className="space-y-4">
                                    <h3 className="text-[1.3rem] font-extrabold text-[#111] mb-6 flex items-center gap-2 tracking-tight"><Phone className="w-6 h-6 text-gray-400" /> 연락처 및 인적사항</h3>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">국적</span><span className="text-[#111] font-bold">{selectedApplicant.nationality || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">비자/만료일</span><span className="text-[#111] font-bold">{selectedApplicant.visa_type ? `${selectedApplicant.visa_type} (${selectedApplicant.visa_period || '기간 미정'})` : '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">휴대폰</span><span className="text-[#111] font-bold">{selectedApplicant.phone || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">카카오톡</span><span className="text-[#111] font-bold">{selectedApplicant.kakao_id || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">거주지</span><span className="text-[#111] font-bold">{selectedApplicant.address || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">출퇴근 소요</span><span className="text-[#111] font-bold">{selectedApplicant.commute_time || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">유니폼 사이즈</span><span className="text-[#111] font-bold">{selectedApplicant.uniform_size || '-'}</span></div>
                                </div>

                                {/* 근무 조건 */}
                                <div className="space-y-4">
                                    <h3 className="text-[1.3rem] font-extrabold text-[#111] mb-6 flex items-center gap-2 tracking-tight"><Calendar className="w-6 h-6 text-gray-400" /> 근무 희망 조건</h3>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">희망 요일</span><span className="text-[#111] font-bold">{Array.isArray(selectedApplicant.days) && selectedApplicant.days.length > 0 ? selectedApplicant.days.join(', ') : selectedApplicant.days || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">근무 일수</span><span className="text-[#111] font-bold">{selectedApplicant.days_per_week || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">희망 기간</span><span className="text-[#111] font-bold">{selectedApplicant.duration || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">시작 가능일</span><span className="text-[#111] font-bold">{selectedApplicant.start_date || '-'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">지원 경로</span><span className="text-[#111] font-bold">{selectedApplicant.source || '-'}</span></div>
                                </div>

                                {/* 경력 및 역량 */}
                                <div className="md:col-span-2 space-y-4 mt-6 print:mt-2">
                                    <h3 className="text-[1.3rem] font-extrabold text-[#111] mb-6 flex items-center gap-2 tracking-tight"><Clock className="w-6 h-6 text-gray-400" /> 경력 및 보유 역량 세부</h3>
                                    <div className="bg-gray-50 print:bg-white print:border-gray-200 p-8 rounded-[24px] flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-[13px] font-bold mb-2 uppercase tracking-tight">동일 업종 경험 유무</p>
                                            <p className="font-extrabold text-xl text-[#111]">{selectedApplicant.has_industry_exp || (selectedApplicant.exp_hotel === '유' ? '있음' : '없음')}</p>
                                        </div>
                                        <div className="flex-[2]">
                                            <p className="text-gray-400 text-[13px] font-bold mb-2 uppercase tracking-tight">수행 가능한 세부 주요 직무</p>
                                            <p className="font-extrabold text-lg text-blue-600">
                                                {Array.isArray(selectedApplicant.industry_tasks) && selectedApplicant.industry_tasks.length > 0 ? selectedApplicant.industry_tasks.join('  /  ') : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6">
                                        <h3 className="text-[1.3rem] font-extrabold text-[#111] mb-2 flex items-center gap-2 tracking-tight">지원 동기</h3>
                                        <div className="bg-gray-50 print:bg-white print:border-gray-200 p-8 rounded-[24px]">
                                            <p className="text-[#111] font-medium leading-relaxed whitespace-pre-wrap">{selectedApplicant.motivation || '-'}</p>
                                        </div>
                                    </div>

                                    {/* 이력서 첨부 및 다운로드 UI */}
                                    {(selectedApplicant.resumeUrl || selectedApplicant.resume_url) && (
                                        <div className="mt-10 p-8 bg-blue-50/60 rounded-[24px] border border-blue-100/60 print:hidden">
                                            <h3 className="text-[1.2rem] font-extrabold text-[#111] mb-4 flex items-center gap-2">
                                                <FileDown className="w-6 h-6 text-blue-600 print:text-black" /> 이력서 파일 (첨부됨)
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-6 font-medium print:mb-2">지원자가 이력서 및 포트폴리오를 별도로 제출했습니다.</p>
                                            <a
                                                href={selectedApplicant.resumeUrl || selectedApplicant.resume_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all w-full md:w-auto shadow-[0_8px_20px_rgba(37,99,235,0.2)] active:scale-95 group font-bold print:bg-white print:text-blue-600 print:border print:border-blue-600 print:shadow-none print:py-2 print:px-4 print:rounded-md"
                                            >
                                                <span className="text-[16px] print:text-sm">제출된 원본 열기 / 다운로드 (새 창)</span>
                                            </a>
                                            <p className="hidden print:block text-xs text-gray-500 mt-2 break-all">URL: {selectedApplicant.resumeUrl || selectedApplicant.resume_url}</p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedRoom ? (
                    /* 채팅창 모드 */
                    <div className="flex-1 flex flex-col h-full bg-white relative z-10 overflow-hidden">
                        {/* 채팅 헤더 */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold">{selectedRoom.name}님과의 대화</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedRoom.age}세 · {selectedRoom.gender} · {selectedRoom.phone}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="md:hidden p-2 bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        
                        {/* 메세지 목록 */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {currentChatMessages.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'manager' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'manager' ? 'bg-[#111] text-white rounded-tr-none' : 'bg-white text-[#111] border border-gray-100 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 입력창 */}
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (adminInput.trim()) {
                                        sendAdminMessage(adminInput, 'manager');
                                        setAdminInput('');
                                    }
                                }}
                                className="flex gap-3"
                            >
                                <input 
                                    type="text" 
                                    value={adminInput}
                                    onChange={(e) => setAdminInput(e.target.value)}
                                    placeholder="답장을 입력하세요..."
                                    className="flex-1 bg-gray-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-[#111] transition-all font-medium"
                                />
                                <button className="bg-[#111] text-white px-6 py-4 rounded-2xl hover:bg-[#333] transition-all"><Send className="w-5 h-5"/></button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex-1 flex items-center justify-center text-gray-400 print:hidden bg-[#f3f4f6]">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white mb-6">
                                {viewMode === 'applications' ? <Mail className="w-10 h-10 text-gray-300" /> : <MessageSquare className="w-10 h-10 text-gray-300" />}
                            </div>
                            <p className="text-lg font-extrabold text-gray-500 tracking-tight">
                                {viewMode === 'applications' ? '좌측 목록에서 지원자를 클릭해주세요' : '좌측 목록에서 대화방을 선택해주세요'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminPage;
