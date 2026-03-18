import { useState } from 'react';
import { X, User, Phone, Users, Calendar } from 'lucide-react';

interface InquiryFormProps {
    onSubmit: (data: { name: string; phone: string; gender: string; age: string }) => void;
    onClose: () => void;
}

const InquiryForm = ({ onSubmit, onClose }: InquiryFormProps) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && gender && age) {
            onSubmit({ name, phone, gender, age });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#111] p-4 flex justify-between items-center text-white">
                <h3 className="font-serif font-bold tracking-tight">Stay Ari Tokyo 채용 문의</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-500 font-medium">원활한 상담을 위해<br/>기본 정보를 먼저 입력해 주세요.</p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="성함"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="연락처 (또는 카톡 ID)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition-all text-sm font-medium appearance-none"
                            >
                                <option value="">성별</option>
                                <option value="남성">남성</option>
                                <option value="여성">여성</option>
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                placeholder="나이"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-[#111] text-white font-bold py-4 rounded-xl hover:bg-[#333] transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                        상담 시작하기
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-4">
                        평일 09:00 - 18:00 (답장이 늦어질 수 있습니다)
                    </p>
                </div>
            </form>
        </div>
    );
};

export default InquiryForm;
