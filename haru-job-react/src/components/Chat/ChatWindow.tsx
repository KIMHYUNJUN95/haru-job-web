import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

interface ChatWindowProps {
    roomId: string;
    applicantName: string;
    onClose: () => void;
}

const ChatWindow = ({ roomId, applicantName, onClose }: ChatWindowProps) => {
    const { messages, sendMessage } = useChat(roomId);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            sendMessage(inputText, 'user');
            setInputText('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-[#111] p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-serif font-bold text-xs">SA</div>
                    <div>
                        <h3 className="font-serif font-bold tracking-tight text-sm">Stay Ari Tokyo 채용 담당자</h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isBusinessHours() ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            <span className="text-[10px] text-white/60 font-medium">{isBusinessHours() ? '운영 중' : '운영 시간 외'}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                <div className="text-center py-2">
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-bold">대화가 시작되었습니다</span>
                </div>

                {!isBusinessHours() && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[12px] text-amber-700 font-medium leading-relaxed">
                        현재는 정규 상담 시간이 아닙니다. 메세지를 남겨주시면 업무 시간(평일 09:00~18:00)에 채용 담당자가 확인 후 답변해 드리겠습니다.
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-[14px] font-medium leading-snug shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-[#111] text-white rounded-tr-none' 
                                : 'bg-white text-[#111] border border-gray-100 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="메세지를 입력하세요..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-gray-200 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="bg-[#111] text-white p-3 rounded-xl hover:bg-[#333] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
