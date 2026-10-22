import { useState, useEffect, useRef } from 'react';
import { X, Send, LogOut, Image, Paperclip, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';

interface ChatWindowProps {
    roomId: string;
    onClose: () => void;
    isAdmin?: boolean;
    shouldMarkAsRead?: boolean;
}

const ChatWindow = ({ roomId, onClose, isAdmin = false, shouldMarkAsRead = true }: ChatWindowProps) => {
    const { messages, sendMessage, leaveChat, uploadFile } = useChat(roomId, isAdmin, shouldMarkAsRead);
    const [inputText, setInputText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 운영 시간 체크 (평일 09:00 - 18:00)
    const isBusinessHours = () => {
        const now = new Date();
        const day = now.getDay(); // 0(일) ~ 6(토)
        const hour = now.getHours();
        return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            await sendMessage(inputText, isAdmin ? 'manager' : 'user');
            setInputText('');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 용량 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 용량은 10MB 이하만 가능합니다.');
            return;
        }

        try {
            setIsUploading(true);
            const url = await uploadFile(file);
            if (url) {
                await sendMessage('', isAdmin ? 'manager' : 'user', {
                    url,
                    name: file.name,
                    type: file.type
                });
            }
        } catch (error) {
            console.error('File upload failed:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLeave = async () => {
        if (window.confirm('채팅방을 나가시겠습니까? 나가면 모든 대화 내역이 초기화됩니다.')) {
            await leaveChat();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto flex flex-col h-full bg-white md:rounded-2xl md:shadow-2xl overflow-hidden border-t md:border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-[#111] p-4 md:p-5 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-serif font-bold text-xs">SA</div>
                    <div>
                        <h3 className="font-serif font-bold tracking-tight text-sm">Stay Ari Tokyo {isAdmin ? '실시간 문의' : '채용 담당자'}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isBusinessHours() ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            <span className="text-[10px] text-white/60 font-medium">{isBusinessHours() ? '운영 중' : '운영 시간 외'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!isAdmin && (
                        <button 
                            onClick={handleLeave} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                            title="채팅 나가기"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>나가기</span>
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90 ml-1">
                        <X className="w-6 h-6 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 touch-pan-y">
                {/* 7일 유지 안내 문구 (지원자 전용) */}
                {!isAdmin && (
                    <div className="bg-blue-50/50 border border-blue-100/30 p-3 rounded-xl text-center">
                        <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                            💡 실시간 채용 상담 기록은 개인정보 보호를 위해 <br /> 최근 7일간의 기록만 유지됩니다.
                        </p>
                    </div>
                )}

                <div className="text-center py-2">
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-bold">대화가 시작되었습니다</span>
                </div>

                {!isBusinessHours() && !isAdmin && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[12px] text-amber-700 font-medium leading-relaxed">
                        현재는 정규 상담 시간이 아닙니다. 메세지를 남겨주시면 업무 시간(평일 09:00~18:00)에 채용 담당자가 확인 후 답변해 드리겠습니다.
                    </div>
                )}

                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-[10px] bg-gray-200/70 text-gray-500 px-3 py-1 rounded-full font-bold">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    const isMyMessage = isAdmin ? msg.sender === 'manager' : msg.sender === 'user';
                    return (
                        <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col items-end gap-1 max-w-[85%]">
                                <div className="flex items-end gap-1.5">
                                    {isMyMessage && !msg.isRead && (
                                        <span className="text-[10px] font-bold text-amber-500 mb-0.5 animate-pulse">읽지않음</span>
                                    )}
                                    <div className={`p-3 rounded-2xl text-[15px] font-medium leading-snug shadow-sm ${
                                        isMyMessage 
                                            ? 'bg-[#111] text-white rounded-tr-none' 
                                            : 'bg-white text-[#111] border border-gray-100 rounded-tl-none'
                                    }`}>
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
                                                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isMyMessage ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                                                    >
                                                        <div className="p-2 bg-white rounded-md shadow-sm">
                                                            <Paperclip className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-bold truncate ${isMyMessage ? 'text-white' : 'text-[#111]'}`}>{msg.fileName}</p>
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
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 text-gray-400 hover:text-[#111] hover:bg-gray-100 rounded-xl transition-all disabled:opacity-30"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                    </button>
                    <input
                        type="text"
                        placeholder="메세지를 입력하세요..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-gray-200 transition-all placeholder:text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isUploading}
                        className="bg-[#111] text-white p-3 rounded-xl hover:bg-[#333] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>

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

export default ChatWindow;
