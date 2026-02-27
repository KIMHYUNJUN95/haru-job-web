import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ApplicationPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const totalSteps = 4; // 단계 간소화 (기본, 일정, 경험, 첨부)

    const [formData, setFormData] = useState({
        name: '', age: '', gender: '', phone: '', kakao_id: '',
        address: '', commute_time: '', uniform_size: '', nationality: '대한민국',
        visa_type: '', visa_period: '',
        days: [] as string[], days_per_week: '', duration: '', start_date: '',
        // 추가 역량 및 업종 경험 관련 필드
        has_industry_exp: '', // '예', '아니오'
        industry_tasks: [] as string[], // '베딩', '인포메이션(프론트)', '객실 청소', '기타'
        resume_file: null as File | null, // 이력서 첨부 (선택)
    });

    const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps + 1));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // 파일 첨부 처리
        if (type === 'file') {
            const fileTarget = e.target as HTMLInputElement;
            if (fileTarget.files && fileTarget.files.length > 0) {
                setFormData(prev => ({ ...prev, [name]: fileTarget.files![0] }));
            }
        }
        // 체크박스 (다중 선택) 다루기
        else if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setFormData(prev => {
                const list = (prev[name as keyof typeof prev] || []) as string[];
                if (target.checked) return { ...prev, [name]: [...list, value] };
                return { ...prev, [name]: list.filter(item => item !== value) };
            });
        }
        // 일반 텍스트 및 라디오
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let resumeUrl = null;

            // 1. 첨부파일(이력서)이 있을 경우 Firebase Storage 업로드
            if (formData.resume_file) {
                const file = formData.resume_file;
                const fileRef = ref(storage, `resumes/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(fileRef, file);
                resumeUrl = await getDownloadURL(snapshot.ref);
            }

            // 2. 지원서 데이터 Firestore 저장
            const applicationData = {
                name: formData.name,
                age: formData.age,
                gender: formData.gender,
                phone: formData.phone,
                kakao_id: formData.kakao_id,
                address: formData.address,
                commute_time: formData.commute_time,
                uniform_size: formData.uniform_size,
                nationality: formData.nationality,
                visa_type: formData.visa_type,
                visa_period: formData.visa_period,
                days: formData.days,
                days_per_week: formData.days_per_week,
                duration: formData.duration,
                start_date: formData.start_date,
                has_industry_exp: formData.has_industry_exp,
                industry_tasks: formData.industry_tasks,
                resumeUrl: resumeUrl, // 업로드된 이력서 링크 (없으면 null)
                createdAt: serverTimestamp(),
                status: '대기 중' // 관리자 대시보드 관리용 초기 상태
            };

            await addDoc(collection(db, 'applications'), applicationData);

            // 3. 성공 화면 렌더링을 위해 다음 단계 이동
            nextStep();
        } catch (error) {
            console.error("지원서 제출 에러:", error);
            alert("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] mb-8">기본 인적 사항</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">1. 성명 *</label><input required className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="name" onChange={handleChange} value={formData.name} placeholder="성명을 입력하세요" /></div>
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">2. 만 나이 *</label><input required type="number" className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="age" onChange={handleChange} value={formData.age} placeholder="만 나이" /></div>

                            <div className="md:col-span-2">
                                <label className="block text-[13px] font-bold text-[#555] mb-3 uppercase">3. 성별 *</label>
                                <div className="flex gap-4">
                                    {['남성', '여성'].map(g => (
                                        <label key={g} className="cursor-pointer flex-1 md:flex-none">
                                            <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="hidden" />
                                            <div className={`px-8 py-4 rounded-2xl border text-center font-semibold transition-all shadow-sm ${formData.gender === g ? 'bg-[#111] text-white border-[#111]' : 'bg-[#f9f9f9] border-[#ddd] text-[#666] hover:border-[#aaa]'}`}>{g}</div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">4. 휴대폰 번호 *</label><input required className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="phone" onChange={handleChange} value={formData.phone} placeholder="010-0000-0000" /></div>
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">5. 카카오톡 ID *</label><input required className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="kakao_id" onChange={handleChange} value={formData.kakao_id} placeholder="카카오톡 ID" /></div>

                            <div className="md:col-span-2"><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">6. 현재 거주지</label><input className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="address" onChange={handleChange} value={formData.address} placeholder="예: 도쿄도 신주쿠구" /></div>

                            <div>
                                <label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">7. 출퇴근 소요 시간</label>
                                <select className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm appearance-none cursor-pointer" name="commute_time" onChange={handleChange} value={formData.commute_time}>
                                    <option value="" disabled>선택해주세요</option>
                                    <option value="30분 이내">30분 이내</option>
                                    <option value="30분~1시간">30분 ~ 1시간</option>
                                    <option value="1시간 이상">1시간 이상</option>
                                </select>
                            </div>

                            {/* 유니폼 사이즈 문항 추가 */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">8. 유니폼 사이즈 *</label>
                                <select required className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm appearance-none cursor-pointer" name="uniform_size" onChange={handleChange} value={formData.uniform_size}>
                                    <option value="" disabled>치수를 선택해주세요</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>

                            {/* 순서 조정됨 (9, 10, 11) */}
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">9. 국적</label><input className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="nationality" onChange={handleChange} value={formData.nationality} /></div>
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">10. 비자 종류</label><input className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="visa_type" onChange={handleChange} value={formData.visa_type} placeholder="예: 워킹홀리데이" /></div>
                            <div><label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">11. 비자 만료일</label><input className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="visa_period" onChange={handleChange} value={formData.visa_period} placeholder="예: 2025년 6월" /></div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] mb-8">근무 희망 일정</h2>

                        <div>
                            <label className="block text-[13px] font-bold text-[#555] mb-4 uppercase">12. 근무 희망 요일</label>
                            <div className="flex flex-wrap gap-3">
                                {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                                    <label key={d} className="cursor-pointer">
                                        <input type="checkbox" name="days" value={d} checked={formData.days.includes(d)} onChange={handleChange} className="hidden" />
                                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border text-[15px] font-bold shadow-sm transition-all ${formData.days.includes(d) ? 'bg-[#111] text-white border-[#111]' : 'bg-[#f9f9f9] border-[#ddd] text-[#666] hover:border-[#aaa]'}`}>{d}</div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-4">
                            <div>
                                <label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">13. 주당 근로 일수</label>
                                <select className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm appearance-none cursor-pointer" name="days_per_week" onChange={handleChange} value={formData.days_per_week}>
                                    <option value="" disabled>선택</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={`${n}일`}>주 {n}일</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">14. 희망 근무 기간</label>
                                <select className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm appearance-none cursor-pointer" name="duration" onChange={handleChange} value={formData.duration}>
                                    <option value="" disabled>선택</option>
                                    <option value="1개월">1개월 미만</option>
                                    <option value="3개월">3개월</option>
                                    <option value="6개월">6개월</option>
                                    <option value="1년">1년 이상 (장기)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[13px] font-bold text-[#555] mb-2 uppercase">15. 근무 시작 가능일</label>
                                <input className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] focus:bg-white text-[#111] transition-all shadow-sm" name="start_date" onChange={handleChange} value={formData.start_date} placeholder="예: 즉시 가능" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] mb-8">관련 경험 및 추가 역량</h2>

                        {/* 동일 업종 경험 여부 */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#555] mb-4 uppercase">16. 호텔/숙박/공간 관리 등 동일 업종 경험이 있으신가요? *</label>
                            <div className="flex gap-4">
                                {['있음', '없음'].map(opt => (
                                    <label key={opt} className="cursor-pointer flex-1 md:flex-none">
                                        <input required type="radio" name="has_industry_exp" value={opt} checked={formData.has_industry_exp === opt} onChange={handleChange} className="hidden" />
                                        <div className={`px-10 py-5 rounded-2xl border text-center font-bold text-[15px] transition-all shadow-sm ${formData.has_industry_exp === opt ? 'bg-[#111] text-white border-[#111]' : 'bg-[#f9f9f9] border-[#ddd] text-[#666] hover:border-[#aaa]'}`}>{opt}</div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 경험이 있을 경우에만 세부 항목 선택 표시 (조건부 렌더링) */}
                        <AnimatePresence>
                            {formData.has_industry_exp === '있음' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 bg-[#f9f9f9] border border-[#eee] rounded-[24px]">
                                        <label className="block text-[13px] font-bold text-[#111] mb-4">16-1. 어떠한 업무를 해보셨나요? (다중 선택 가능)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['객실 베딩(Bedding)', '인포메이션(프론트)', '객실 청소/유지보수', '재고 및 비품 관리', '외국어 응대', '기타 직무'].map(task => (
                                                <label key={task} className="cursor-pointer">
                                                    <input type="checkbox" name="industry_tasks" value={task} checked={formData.industry_tasks.includes(task)} onChange={handleChange} className="hidden" />
                                                    <div className={`w-full h-full flex items-center justify-center p-4 rounded-xl border text-[14px] font-semibold text-center transition-all shadow-sm ${formData.industry_tasks.includes(task) ? 'bg-[#D4AF37]/10 text-[#a88214] border-[#D4AF37]' : 'bg-white border-[#ddd] text-[#666] hover:border-[#aaa]'}`}>{task}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] mb-8">이력서 및 포트폴리오 첨부</h2>

                        <div className="relative border-2 border-dashed border-[#ccc] bg-[#f9f9f9] rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-colors hover:border-[#888] hover:bg-[#f0f0f0] group cursor-pointer min-h-[300px]">
                            <input
                                type="file"
                                name="resume_file"
                                onChange={handleChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.hwp"
                            />

                            {formData.resume_file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-[#111] text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-[18px] text-[#111]">{formData.resume_file.name}</p>
                                    <p className="text-[13px] text-[#666] mt-2">파일이 정상적으로 첨부되었습니다.</p>
                                    <p className="text-[12px] font-bold text-blue-600 mt-4 px-4 py-1.5 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">파일 변경하기</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center pointer-events-none">
                                    <div className="w-20 h-20 bg-white shadow-sm border border-[#eee] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                        <svg className="w-8 h-8 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="font-extrabold text-[16px] text-[#111]">여기를 눌러 이력서 파일을 첨부해주세요</p>
                                    <p className="text-[14px] text-[#777] mt-2">또는 파일을 화면 안으로 드래그합니다.</p>
                                    <div className="mt-5 px-4 py-2 bg-[#111]/5 rounded-full">
                                        <p className="text-[12px] font-bold text-[#555] tracking-tight">※ 이력서 첨부는 선택사항이므로 건너뛰셔도 자유롭게 지원 가능합니다.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 5: // Success State
                return (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-6 shadow-xl">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-[2.5rem] font-extrabold text-[#1a1a1a] mb-2 tracking-tight">지원 완료</h2>
                        <p className="text-[#666] max-w-md mx-auto leading-[1.8] text-[15px]">
                            Stay Ari와 함께하는 여정에 첫 걸음을 떼어주셔서 감사합니다. <br /> 접수된 내용은 꼼꼼히 검토 후 연락 드리겠습니다.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-10 bg-[#111] hover:bg-[#333] text-white px-10 py-4 rounded-full font-bold transition-colors shadow-lg shadow-black/10 active:scale-95"
                        >
                            홈으로 돌아가기
                        </button>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] pt-24 pb-16 px-4 md:px-0 text-[#1a1a1a] relative flex flex-col items-center selection:bg-[#111] selection:text-white">
            {/* Background Decor - White theme soft overlays */}
            <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[100px] pointer-events-none opacity-80" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />

            <div className="max-w-3xl w-full relative z-10 flex flex-col flex-1">

                {/* Header & Progress Bar */}
                {step <= totalSteps && (
                    <div className="mb-12">
                        <h1 className="text-3xl md:text-[2.5rem] font-extrabold mb-6 tracking-tight text-center">Stay Ari 지원서 작성</h1>
                        <div className="h-1.5 w-full bg-[#e5e7eb] rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full bg-[#111]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3 px-1">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-[#888]">Progress</span>
                            <span className="text-[12px] font-bold text-[#111]">Step {step} of {totalSteps}</span>
                        </div>
                    </div>
                )}

                {/* Form Container */}
                <div className="bg-white p-8 md:p-14 rounded-[32px] w-full flex-1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 relative">
                    <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        {step <= totalSteps && (
                            <div className="mt-14 flex justify-between items-center pt-8 border-t border-[#eee]">
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep} className="flex items-center gap-2 text-[#777] font-semibold hover:text-[#111] transition-colors duration-300 px-5 py-3 rounded-xl hover:bg-[#f5f5f5] active:scale-95">
                                        <ArrowLeft className="w-5 h-5" />
                                        이전
                                    </button>
                                ) : <div />}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-[#111] hover:bg-[#333] text-white px-10 py-4 rounded-2xl font-bold transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] active:scale-95 group disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            제출 중...
                                        </>
                                    ) : (
                                        <>
                                            {step === totalSteps ? '제출하기' : '다음 단계'}
                                            {step < totalSteps && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ApplicationPage;
