import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, Trash2, Mail, Phone, Calendar, Clock, Printer, FileDown, X, MessageSquare, Send, Trash, Image, Paperclip, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, type Message as ChatMessage } from '../hooks/useChat';

interface ChatRoom {
    id: string;
    name?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    lastMessage?: string;
    lastMessageTime?: Timestamp;
    lastSenderRole?: 'user' | 'manager' | 'system';
    status?: string;
    userStatus?: string;
    createdAt?: Timestamp;
    [key: string]: unknown;
}

type ApplicantTypeFilter = 'all' | 'part-time' | 'full-time';

export interface Applicant {
    id: string;
    job_id?: string;
    job_title?: string;
    employment_type?: string;
    applied_position?: string;
    name?: string;
    age?: string | number;
    gender?: string;
    appliedAt?: Timestamp;
    createdAt?: Timestamp;
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
    _collection?: 'applicants' | 'applications';
}

const AdminPage = () => {
    const navigate = useNavigate();

    // 간편 로그인 상수
    const ADMIN_PASSWORD = '9595';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [applicantSearch, setApplicantSearch] = useState('');
    const [applicantTypeFilter, setApplicantTypeFilter] = useState<ApplicantTypeFilter>('all');
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
    
    // 채팅 관련 상태
    const [viewMode, setViewMode] = useState<'applications' | 'chats'>('applications');
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [adminInput, setAdminInput] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const { messages: currentChatMessages, sendMessage: sendAdminMessage, uploadFile: uploadAdminFile } = useChat(selectedRoomId, true, !!selectedRoomId);
    const [isAdminUploading, setIsAdminUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const adminFileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isInitialData = useRef(true);
    const normalizedApplicantSearch = applicantSearch.trim().replace(/\s+/g, '').toLocaleLowerCase('ko-KR');
    const fullTimeApplicantCount = applicants.filter(app => app.employment_type === '정사원').length;
    const partTimeApplicantCount = applicants.length - fullTimeApplicantCount;
    const filteredApplicants = applicants.filter(app => {
        const isFullTime = app.employment_type === '정사원';
        const matchesType = applicantTypeFilter === 'all'
            || (applicantTypeFilter === 'full-time' && isFullTime)
            || (applicantTypeFilter === 'part-time' && !isFullTime);
        const normalizedName = (app.name || '').replace(/\s+/g, '').toLocaleLowerCase('ko-KR');
        const matchesSearch = !normalizedApplicantSearch || normalizedName.includes(normalizedApplicantSearch);
        return matchesType && matchesSearch;
    });

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
                    const ts = item.appliedAt || item.createdAt;
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

    const handleAdminFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedRoom?.id) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('파일 용량은 10MB 이하만 가능합니다.');
            return;
        }

        try {
            setIsAdminUploading(true);
            const url = await uploadAdminFile(file);
            if (url) {
                await sendAdminMessage('', 'manager', {
                    url,
                    name: file.name,
                    type: file.type
                });
            }
        } catch (error) {
            console.error('Admin file upload failed:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsAdminUploading(false);
            if (adminFileInputRef.current) adminFileInputRef.current.value = '';
        }
    };

    // 채팅방 목록 가져오기 (배경에서 상시 업데이트)
    useEffect(() => {
        if (!isAuthenticated) return;

        // 알림 권한 요청 (브라우저 지원 여부 확인)
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }

        // 알림음 설정
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

        const q = query(collection(db, 'chat_rooms'), orderBy('lastMessageTime', 'desc'));
        const unsubscribeChats = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (!isInitialData.current && (change.type === 'modified' || change.type === 'added')) {
                    const data = change.doc.data();
                    // 관리자가 보낸 것이 아니고, 마지막 보낸 사람이 user인 경우에만 알림
                    if (data.lastSenderRole === 'user') {
                        // 브라우저 알림 (지원 여부 및 권한 확인)
                        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                            new Notification('새로운 메시지', {
                                body: `${data.name}: ${data.lastMessage}`,
                                icon: '/favicon.ico'
                            });
                        }
                        // 소리 재생
                        audioRef.current?.play().catch((err) => console.log('Audio play failed:', err));
                    }
                }
            });

            const rooms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setChatRooms(rooms);
            // 모든 초기 데이터 로드가 완료되었다고 가정 (채팅방 목록이 먼저 오든 지원서가 먼저 오든)
            if (isInitialData.current && rooms.length > 0) {
                // 약간의 지연 후 초기 데이터 무시 설정
                setTimeout(() => { isInitialData.current = false; }, 1000);
            }
        });

        // 신규 지원서 실시간 감지
        const qApp = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
        const unsubscribeApps = onSnapshot(qApp, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (!isInitialData.current && change.type === 'added') {
                    const data = change.doc.data();
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification('새로운 지원서 접수', {
                            body: `지원자: ${data.name} (${data.age}세 / ${data.phone})`,
                            icon: '/favicon.ico'
                        });
                    }
                    audioRef.current?.play().catch((err) => console.log('Audio play failed:', err));
                }
            });
        });

        return () => {
            unsubscribeChats();
            unsubscribeApps();
        };
    }, [isAuthenticated]);

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

    const handleDelete = async (id: string, name?: string) => {
        if (window.confirm(`정말로 지원자 [${name || '이름없음'}]님의 정보를 삭제하시겠습니까?`)) {
            try {
                // applications 컬렉션에서 삭제 시도
                await deleteDoc(doc(db, 'applications', id));
                // applicants 컬렉션에서 삭제 시도 (혹시 모르니)
                await deleteDoc(doc(db, 'applicants', id));
                
                if (selectedApplicant?.id === id) {
                    setSelectedApplicant(null);
                    setIsMobileDetailOpen(false);
                }
            } catch (e) {
                console.error('Error deleting applicant:', e);
            }
        }
    };

    const handleDeleteChatRoom = async (e: React.MouseEvent, room: ChatRoom) => {
        e.stopPropagation(); // 부모 div의 클릭 이벤트 방지
        if (window.confirm(`[${room.name}]님의 상담 내역과 지원 정보를 모두 삭제하시겠습니까?`)) {
            try {
                // 1. 채팅방 삭제
                await deleteDoc(doc(db, 'chat_rooms', room.id));

                // 2. 관련된 지원자 정보 삭제 (연락처 기준)
                if (room.phone) {
                    const collections = ['applications', 'applicants'];
                    for (const colName of collections) {
                        const q = query(collection(db, colName), where('phone', '==', room.phone));
                        const snapshot = await getDocs(q);
                        snapshot.forEach(async (d) => {
                            await deleteDoc(doc(db, colName, d.id));
                        });
                    }
                }

                if (selectedRoom?.id === room.id) {
                    setSelectedRoom(null);
                    setIsMobileDetailOpen(false);
                }
                alert('삭제되었습니다.');
            } catch (error) {
                console.error('Error deleting chat room:', error);
                alert('삭제 중 오류가 발생했습니다.');
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
                                className={`text-sm font-bold pb-1 border-b-2 transition-all flex items-center gap-1.5 ${viewMode === 'chats' ? 'text-[#111] border-[#111]' : 'text-gray-400 border-transparent'}`}
                            >
                                실시간 문의 ({chatRooms.length})
                                {chatRooms.filter(r => r.lastSenderRole === 'user').length > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                                        {chatRooms.filter(r => r.lastSenderRole === 'user').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100" title="로그아웃">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {viewMode === 'applications' && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                inputMode="search"
                                autoComplete="off"
                                value={applicantSearch}
                                onChange={e => setApplicantSearch(e.target.value)}
                                placeholder="지원자 이름 검색"
                                aria-label="지원자 이름 검색"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-base md:text-sm font-medium text-[#111] placeholder:text-gray-400 outline-none transition-all focus:border-[#111] focus:bg-white focus:ring-2 focus:ring-black/5"
                            />
                            {applicantSearch && (
                                <button
                                    type="button"
                                    onClick={() => setApplicantSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-[#111] hover:bg-gray-100 transition-colors"
                                    aria-label="검색어 지우기"
                                    title="검색어 지우기"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-3 p-1 rounded-xl bg-gray-100" role="group" aria-label="지원자 고용 형태 필터">
                            {([
                                { value: 'all', label: '전체', count: applicants.length },
                                { value: 'part-time', label: '아르바이트', count: partTimeApplicantCount },
                                { value: 'full-time', label: '정사원', count: fullTimeApplicantCount },
                            ] as const).map(filter => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setApplicantTypeFilter(filter.value)}
                                    aria-pressed={applicantTypeFilter === filter.value}
                                    className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold transition-all ${applicantTypeFilter === filter.value ? 'bg-white text-[#111] shadow-sm' : 'text-gray-500 hover:text-[#111]'}`}
                                >
                                    <span className="truncate">{filter.label}</span>
                                    <span className={`shrink-0 tabular-nums ${applicantTypeFilter === filter.value ? 'text-blue-600' : 'text-gray-400'}`}>{filter.count}</span>
                                </button>
                            ))}
                        </div>
                        {(normalizedApplicantSearch || applicantTypeFilter !== 'all') && (
                            <p className="mt-2 px-1 text-[11px] font-bold text-gray-400">표시 중 {filteredApplicants.length}명</p>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 print:hidden bg-gray-50/30">
                    {viewMode === 'applications' ? (
                        /* 기존 지원자 목록 */
                        applicants.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-medium">새로운 지원자가 없습니다.</div>
                        ) : filteredApplicants.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-bold">
                                    {normalizedApplicantSearch
                                        ? '일치하는 지원자가 없습니다.'
                                        : applicantTypeFilter === 'full-time'
                                            ? '접수된 정사원 지원서가 없습니다.'
                                            : '접수된 아르바이트 지원서가 없습니다.'}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {normalizedApplicantSearch ? '이름을 다시 확인해주세요.' : '새 지원서가 접수되면 여기에 표시됩니다.'}
                                </p>
                            </div>
                        ) : (
                            filteredApplicants.map(app => {
                                const appliedAt = app.appliedAt instanceof Timestamp ? app.appliedAt.toDate().toLocaleDateString() : app.createdAt instanceof Timestamp ? app.createdAt.toDate().toLocaleDateString() : '';
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
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${app.employment_type === '정사원' ? 'bg-blue-50 text-blue-700 border-blue-100/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'}`}>{app.employment_type || '아르바이트'}</span>
                                            {app.applied_position && <span className="text-[11px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200">{app.applied_position}</span>}
                                            {(app.has_industry_exp === '있음' || app.exp_hotel === '유') && <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100/50">동종경력</span>}
                                            {(app.resumeUrl || app.resume_url) && <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100/50">이력서 첨부</span>}
                                            {app.employment_type !== '정사원' && <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{app.duration || '기간미정'}</span>}
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
                                        setSelectedRoomId(room.id);
                                        setSelectedApplicant(null);
                                        setIsMobileDetailOpen(true);
                                    }}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedRoom?.id === room.id ? 'bg-white border-[#111] shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:border-gray-200 hover:bg-white'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-extrabold text-[#111]">{room.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">{room.lastMessageTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <button 
                                                onClick={(e) => handleDeleteChatRoom(e, room)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                title="상담 삭제"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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
                                    <button onClick={() => handleDelete(selectedApplicant.id, selectedApplicant.name)} className="flex-1 md:flex-none justify-center text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2 px-5 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border border-red-100">
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
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">지원 구분</span><span className="text-[#111] font-bold">{selectedApplicant.employment_type || '아르바이트'}</span></div>
                                    <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">지원 직무</span><span className="text-[#111] font-bold">{selectedApplicant.applied_position || selectedApplicant.job_title || '객실 클리닝 스태프'}</span></div>
                                    {selectedApplicant.employment_type !== '정사원' && <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">희망 요일</span><span className="text-[#111] font-bold">{Array.isArray(selectedApplicant.days) && selectedApplicant.days.length > 0 ? selectedApplicant.days.join(', ') : selectedApplicant.days || '-'}</span></div>}
                                    {selectedApplicant.employment_type !== '정사원' && <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">근무 일수</span><span className="text-[#111] font-bold">{selectedApplicant.days_per_week || '-'}</span></div>}
                                    {selectedApplicant.employment_type !== '정사원' && <div className="flex gap-4 border-b border-gray-50 py-3"><span className="text-gray-400 font-bold w-28 shrink-0">희망 기간</span><span className="text-[#111] font-bold">{selectedApplicant.duration || '-'}</span></div>}
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
                            <button onClick={() => { setSelectedRoom(null); setIsMobileDetailOpen(false); }} className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        {/* 메세지 목록 */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {currentChatMessages.map((msg: ChatMessage) => {
                                if (msg.sender === 'system') {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-2">
                                            <span className="text-[10px] bg-gray-200/70 text-gray-500 px-3 py-1 rounded-full font-bold">
                                                {msg.text}
                                            </span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={msg.id} className={`flex ${msg.sender === 'manager' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="flex items-end gap-1.5 max-w-[80%]">
                                            {msg.sender === 'manager' && !msg.isRead && (
                                                <span className="text-[10px] font-bold text-amber-500 mb-0.5 animate-pulse">읽지않음</span>
                                            )}
                                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'manager' ? 'bg-[#111] text-white rounded-tr-none' : 'bg-white text-[#111] border border-gray-100 rounded-tl-none'}`}>
                                                {msg.fileUrl && (
                                                    <div className="mb-2">
                                                        {msg.fileType?.startsWith('image/') ? (
                                                            <div className="relative group">
                                                                <img 
                                                                    src={msg.fileUrl} 
                                                                    alt={msg.fileName} 
                                                                    className="max-h-[160px] md:max-h-[240px] w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-white shadow-sm border border-gray-100"
                                                                    onClick={() => setSelectedImage(msg.fileUrl || null)}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                                    <div className="bg-black/20 backdrop-blur-sm p-2 rounded-full">
                                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <a 
                                                                href={msg.fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${msg.sender === 'manager' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                                                            >
                                                                <div className="p-2 bg-white rounded-md shadow-sm">
                                                                    <Paperclip className="w-4 h-4 text-gray-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-bold truncate ${msg.sender === 'manager' ? 'text-white' : 'text-[#111]'}`}>{msg.fileName}</p>
                                                                    <p className="text-[10px] opacity-60 uppercase">{msg.fileType?.split('/')[1] || 'FILE'}</p>
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
                                    type="file" 
                                    ref={adminFileInputRef}
                                    onChange={handleAdminFileChange}
                                    className="hidden"
                                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
                                />
                                <button
                                    type="button"
                                    onClick={() => adminFileInputRef.current?.click()}
                                    disabled={isAdminUploading}
                                    className="p-4 text-gray-400 hover:text-[#111] hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-30"
                                >
                                    {isAdminUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                                </button>
                                <input 
                                    type="text" 
                                    value={adminInput}
                                    onChange={(e) => setAdminInput(e.target.value)}
                                    placeholder="답장을 입력하세요..."
                                    className="flex-1 bg-gray-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-[#111] transition-all font-medium"
                                />
                                <button disabled={(!adminInput.trim() && !isAdminUploading) || isAdminUploading} className="bg-[#111] text-white px-6 py-4 rounded-2xl hover:bg-[#333] transition-all disabled:opacity-30"><Send className="w-5 h-5"/></button>
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

            {/* Lightbox / Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button 
                            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-[210] active:scale-90"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage} 
                            alt="Full View" 
                            className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPage;
