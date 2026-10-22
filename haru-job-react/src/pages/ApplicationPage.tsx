import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animate, stagger } from 'framer-motion';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jobPostings } from '../data/jobs';
import Shell from '../components/site/Shell';
import { ChevL } from '../components/site/icons';
import { EASE_OUT, prefersReducedMotion, useGo } from '../components/site/nav';

type FormData = {
    name: string; age: string; gender: string; phone: string; kakao_id: string;
    address: string; commute_time: string; uniform_size: string; nationality: string;
    visa_type: string; visa_period: string;
    days: string[]; days_per_week: string; duration: string; start_date: string;
    applied_position: string;
    has_industry_exp: string; // '있음' | '없음'
    industry_tasks: string[];
    source: string; // 지원 경로
    motivation: string; // 지원 동기
    resume_file: File | null; // 이력서 첨부
};
type TextKey = { [K in keyof FormData]: FormData[K] extends string ? K : never }[keyof FormData];
type ListKey = 'days' | 'industry_tasks';

const TOTAL_STEPS = 4; // 기본, 일정, 경험, 첨부
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const Req = ({ on }: { on: boolean }) => (on ? <span className="req must">필수</span> : <span className="req">선택</span>);

const ApplicationPage = () => {
    const go = useGo();
    const [searchParams] = useSearchParams();
    const requestedJobId = searchParams.get('job') || 'cleaning-staff';
    const selectedJob = jobPostings.find(job => job.id === requestedJobId) || jobPostings[0];
    const isFullTime = selectedJob.employmentType === 'full-time';
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [err, setErr] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '', age: '', gender: '', phone: '', kakao_id: '',
        address: '', commute_time: '', uniform_size: '', nationality: '대한민국',
        visa_type: '', visa_period: '',
        days: [], days_per_week: '', duration: '', start_date: '',
        applied_position: '',
        has_industry_exp: '',
        industry_tasks: [],
        source: '',
        motivation: '',
        resume_file: null,
    });

    const formRef = useRef<HTMLFormElement>(null);
    const doneRef = useRef<HTMLDivElement>(null);
    const dirRef = useRef(1);
    const firstRender = useRef(true);

    /* Directional slide between steps (mockup slideStep). */
    useLayoutEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        const el = formRef.current;
        if (step > TOTAL_STEPS || !el || prefersReducedMotion()) return;
        const a = animate(el, {
            opacity: [0, 1],
            x: [dirRef.current * 28, 0],
            filter: ['blur(2px)', 'blur(0px)'],
        }, { duration: 0.25, ease: EASE_OUT });
        a.then(() => { el.style.filter = ''; });
        return () => { a.stop(); el.style.filter = ''; el.style.opacity = ''; el.style.transform = ''; };
    }, [step]);

    /* Success moment (mockup celebrate). */
    useLayoutEffect(() => {
        if (step !== TOTAL_STEPS + 1) return;
        const root = doneRef.current;
        if (!root || prefersReducedMotion()) return;
        const mark = root.querySelector<SVGSVGElement>('.done-mark');
        const circle = root.querySelector<SVGCircleElement>('.done-mark circle');
        const check = root.querySelector<SVGPathElement>('.done-mark path');
        const texts = Array.from(root.querySelectorAll<HTMLElement>('[data-done]'));
        if (mark) mark.style.opacity = '0';
        texts.forEach(t => { t.style.opacity = '0'; });
        /* The stylesheet pins stroke-dashoffset in CSS, which beats the SVG attribute Motion would write,
           so drive the inline style from a plain value animation instead. */
        const draw = (el: SVGElement | null, duration: number, ease: readonly [number, number, number, number], delay = 0) => {
            if (!el) return null;
            el.style.strokeDashoffset = '1';
            return animate(1, 0, { duration, delay, ease: [...ease], onUpdate: v => { el.style.strokeDashoffset = String(v); } });
        };
        const anims = [
            mark && animate(mark, { scale: [0.9, 1], opacity: [0, 1] }, { type: 'spring', duration: 0.6, bounce: 0.25 }),
            draw(circle, 0.6, EASE_IN_OUT),
            draw(check, 0.35, EASE_OUT, 0.45),
            texts.length ? animate(texts, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, delay: stagger(0.05, { startDelay: 0.55 }), ease: EASE_OUT }) : null,
        ];
        return () => {
            anims.forEach(a => a?.stop());
            [circle, check].forEach(el => { if (el) el.style.strokeDashoffset = ''; });
            if (mark) { mark.style.opacity = ''; mark.style.transform = ''; }
            texts.forEach(t => { t.style.opacity = ''; t.style.transform = ''; });
        };
    }, [step]);

    useEffect(() => { window.scrollTo(0, 0); }, [step]);

    const validateStep = (currentStep: number): string => {
        const f = formData;
        if (currentStep === 1) {
            if (!f.name || !f.age || !f.gender || !f.phone || !f.kakao_id || !f.uniform_size) {
                return '성명, 나이, 성별, 휴대폰 번호, 카카오톡 ID, 유니폼 사이즈를 입력해야 다음으로 넘어갈 수 있습니다.';
            }
            if (!f.visa_type || !f.visa_period) {
                return '재류카드에 적힌 재류자격 명칭과 비자 만료일을 모두 입력해주세요.';
            }
            if (isFullTime && (!f.address || !f.nationality)) {
                return '정사원 지원은 현재 거주지와 국적이 필요합니다.';
            }
        }
        if (currentStep === 2 && isFullTime && (!f.applied_position || !f.start_date)) {
            return '지원 직무를 고르고 입사 가능일을 입력해주세요.';
        }
        if (currentStep === 3 && (!f.has_industry_exp || !f.source || !f.motivation)) {
            return '경력 여부, 공고를 본 곳, 지원 동기를 모두 입력해주세요.';
        }
        if (currentStep === 4 && isFullTime && !f.resume_file) {
            return '정사원 지원은 사진이 붙은 이력서 파일이 필요합니다.';
        }
        return '';
    };

    const prevStep = () => {
        dirRef.current = -1;
        setErr('');
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const m = validateStep(step);
        if (m) { setErr(m); window.scrollTo(0, 0); return; }
        setErr('');
        if (step < TOTAL_STEPS) { dirRef.current = 1; setStep(step + 1); return; }

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

            // 2. 지원서 데이터 Firestore 저장 (Cloud Functions · StayOps가 읽는 형식 — 필드 변경 금지)
            const applicationData = {
                job_id: selectedJob.id,
                job_title: selectedJob.title,
                employment_type: selectedJob.type,
                applied_position: isFullTime ? formData.applied_position : selectedJob.title,
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
                source: formData.source,
                motivation: formData.motivation,
                resumeUrl: resumeUrl, // 업로드된 이력서 링크 (없으면 null)
                resumeFileName: formData.resume_file?.name || null,
                createdAt: serverTimestamp(),
                status: '대기 중' // 관리자 대시보드 관리용 초기 상태
            };

            await addDoc(collection(db, 'applications'), applicationData);

            // 3. 성공 화면
            setStep(TOTAL_STEPS + 1);
        } catch (error) {
            console.error("지원서 제출 에러:", error);
            setErr('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------- field helpers (render functions, not components, so inputs keep focus) ---------- */
    const setText = (k: TextKey, v: string) => setFormData(prev => ({ ...prev, [k]: v }));
    const toggle = (k: ListKey, v: string) => setFormData(prev => {
        const list = prev[k];
        return { ...prev, [k]: list.includes(v) ? list.filter(x => x !== v) : [...list, v] };
    });
    const setFile = (file: File | undefined) => {
        if (!file) return;
        setFormData(prev => ({ ...prev, resume_file: file }));
        setErr('');
    };

    const fIn = (k: TextKey, label: string, req: boolean, opts: { type?: string; inputMode?: 'numeric' | 'tel' | 'text'; autoComplete?: string; placeholder?: string; hint?: string; span?: boolean } = {}) => (
        <label className={`fl${opts.span ? ' span2' : ''}`} htmlFor={`ap_${k}`}>
            <span className="l">{label}<Req on={req} /></span>
            <input
                className="in"
                id={`ap_${k}`}
                name={k}
                type={opts.type ?? 'text'}
                inputMode={opts.inputMode}
                autoComplete={opts.autoComplete}
                placeholder={opts.placeholder}
                value={formData[k]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setText(k, e.target.value)}
            />
            {opts.hint && <span className="hint">{opts.hint}</span>}
        </label>
    );

    const fSel = (k: TextKey, label: string, req: boolean, options: [value: string, text: string][], ph = '선택해주세요') => (
        <label className="fl" htmlFor={`ap_${k}`}>
            <span className="l">{label}<Req on={req} /></span>
            <select className="in" id={`ap_${k}`} name={k} value={formData[k]} onChange={e => setText(k, e.target.value)}>
                <option value="" disabled>{ph}</option>
                {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
        </label>
    );

    const tilesWrap = (label: string, req: boolean, hint: string | undefined, cls: string, children: ReactNode) => (
        <div className="fl span2" role="group" aria-label={label}>
            <span className="l">{label}<Req on={req} />{hint && <> <span className="req">· {hint}</span></>}</span>
            <div className={`tiles${cls ? ' ' + cls : ''}`}>{children}</div>
        </div>
    );
    const fPick = (k: TextKey, label: string, req: boolean, list: string[]) => tilesWrap(label, req, undefined, '',
        list.map(v => (
            <button key={v} type="button" className="tl" aria-pressed={formData[k] === v} onClick={() => setText(k, v)}>{v}</button>
        )),
    );
    const fMulti = (k: ListKey, label: string, req: boolean, list: string[], cls = '', hint = '여러 개 선택 가능') => tilesWrap(label, req, hint, cls,
        list.map(v => (
            <button key={v} type="button" className="tl" aria-pressed={formData[k].includes(v)} onClick={() => toggle(k, v)}>{v}</button>
        )),
    );

    /* ---------- success ---------- */
    if (step === TOTAL_STEPS + 1) {
        return (
            <Shell view="apply">
                <div className="ph gut c" style={{ paddingBlock: 140 }}>
                    <div className="w" ref={doneRef}>
                        <svg className="done-mark" width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" pathLength={1} />
                            <path d="M7.5 12.5l3 3 6-6.5" pathLength={1} />
                        </svg>
                        <h1 className="h2" data-done>지원서를 보냈습니다.</h1>
                        <p className="sub2" style={{ margin: '16px auto 0' }} data-done>
                            Stay Ari와 함께하는 첫걸음을 내디뎌 주셔서 감사합니다. 서류를 검토한 뒤 합격자에게 카카오톡으로 연락드려요. 보통 3일 안에 연락드립니다.
                        </p>
                        <div className="hcta" data-done>
                            <button className="pill pill-m" type="button" onClick={() => go('home')}>홈으로 돌아가기</button>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    /* ---------- steps ---------- */
    const titles: [string, string][] = [
        ['기본 정보를 알려주세요.', '재류카드를 보면서 카드에 적힌 그대로 입력해주세요.'],
        isFullTime ? ['어떤 직무에 지원하시나요?', '입사 가능일도 함께 알려주세요.'] : ['언제 일할 수 있나요?', '희망 요일과 기간을 골라주세요.'],
        ['경험과 지원 동기를 들려주세요.', '경험이 없어도 괜찮아요.'],
        ['이력서를 첨부해주세요.', isFullTime ? '정사원은 사진이 붙은 이력서가 필요해요.' : '아르바이트는 이력서 없이도 제출할 수 있어요.'],
    ];

    let body: ReactNode = null;
    if (step === 1) body = (
        <div className="grid2">
            {fIn('name', '성명', true, { autoComplete: 'name', placeholder: '성명을 입력하세요' })}
            {fIn('age', '만 나이', true, { type: 'number', inputMode: 'numeric', placeholder: '만 나이' })}
            {fPick('gender', '성별', true, ['남성', '여성'])}
            {fIn('phone', '휴대폰 번호', true, { type: 'tel', autoComplete: 'tel', placeholder: '010-0000-0000' })}
            {fIn('kakao_id', '카카오톡 ID', true, { placeholder: '카카오톡 ID' })}
            {fIn('address', '현재 거주지', isFullTime, { placeholder: '예: 도쿄도 신주쿠구', span: true })}
            {fSel('commute_time', '출퇴근 소요 시간', false, [['30분 이내', '30분 이내'], ['30분~1시간', '30분 ~ 1시간'], ['1시간 이상', '1시간 이상']])}
            {fSel('uniform_size', '유니폼 사이즈', true, [['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL']], '사이즈 선택')}
            {fIn('nationality', '국적', isFullTime, { span: true })}
            {fIn('visa_type', '비자(재류자격) 정확한 명칭', true, { placeholder: '예: 특정활동(워킹홀리데이)', hint: '재류카드의 ‘재류자격’ 항목 그대로. 예: 유학, 가족체재, 기술·인문지식·국제업무', span: true })}
            {fIn('visa_period', '정확한 비자 만료일', true, { placeholder: '예: 2027년 6월 30일', hint: '남은 개월 수가 아닌 만료일. 영주자는 ‘영주자(기간 없음)’', span: true })}
        </div>
    );
    if (step === 2 && isFullTime) body = (
        <div className="grid2">
            {fPick('applied_position', '지원 직무', true, selectedJob.applicationPositions ?? [])}
            {fIn('start_date', '입사 가능일', true, { placeholder: '예: 2026년 9월 1일 / 즉시 가능', span: true })}
        </div>
    );
    if (step === 2 && !isFullTime) body = (
        <div className="grid2">
            {fMulti('days', '근무 희망 요일', false, ['월', '화', '수', '목', '금', '토', '일'], 'days')}
            {fSel('days_per_week', '주당 근로 일수', false, [1, 2, 3, 4, 5, 6, 7].map(n => [`${n}일`, `주 ${n}일`] as [string, string]))}
            {fSel('duration', '희망 근무 기간', false, [['1개월', '1개월 미만'], ['3개월', '3개월'], ['6개월', '6개월'], ['1년', '1년 이상 (장기)']])}
            {fIn('start_date', '근무 시작 가능일', false, { placeholder: '예: 즉시 가능', span: true })}
        </div>
    );
    if (step === 3) body = (
        <div className="grid2">
            {fPick('has_industry_exp', '호텔·숙박·공간 관리 경험', true, ['있음', '없음'])}
            {formData.has_industry_exp === '있음' && fMulti('industry_tasks', '해본 업무', false, ['객실 베딩(Bedding)', '인포메이션(프론트)', '객실 청소/유지보수', '재고 및 비품 관리', '외국어 응대', '기타 직무'])}
            {fIn('source', '어디서 공고를 보셨나요?', true, { placeholder: '예: 인디드, 페이스북, 지인 소개 등', span: true })}
            <label className="fl span2" htmlFor="ap_motivation">
                <span className="l">지원 동기<Req on /></span>
                <textarea className="in" id="ap_motivation" name="motivation" placeholder="지원하게 된 계기를 자유롭게 적어주세요" value={formData.motivation} onChange={e => setText('motivation', e.target.value)} />
            </label>
        </div>
    );
    if (step === 4) body = (
        <div
            className={`drop${dragOver ? ' over' : ''}`}
            onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
        >
            <input
                type="file"
                id="ap_resume"
                name="resume_file"
                accept=".pdf,.doc,.docx,.hwp"
                aria-label="이력서 파일 선택"
                onChange={e => setFile(e.target.files?.[0])}
            />
            {formData.resume_file ? (
                <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>
                    <b style={{ fontSize: 19, overflowWrap: 'anywhere' }}>{formData.resume_file.name}</b>
                    <span className="hint">첨부했어요. 다른 파일로 바꾸려면 다시 누르세요.</span>
                </>
            ) : (
                <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
                    <b style={{ fontSize: 19 }}>파일을 고르거나 여기로 끌어다 놓으세요</b>
                    <span className="hint">PDF, DOC, DOCX, HWP{isFullTime ? '' : ' · 선택 사항'}</span>
                </>
            )}
        </div>
    );

    return (
        <Shell view="apply">
            <div className="ph gut" style={{ paddingBottom: 24 }}>
                <div className="w form">
                    <button className="crumb" type="button" onClick={() => go(`job:${selectedJob.id}`)}><ChevL />{selectedJob.title}</button>
                    <span className={`badge${isFullTime ? ' ft' : ''}`}>{selectedJob.type}</span>
                    <div className="stepper" aria-hidden="true">
                        {[1, 2, 3, 4].map(n => <span key={n} className={step >= n ? 'on' : ''} />)}
                    </div>
                    <p className="stepnow">{step}/{TOTAL_STEPS} 단계</p>
                </div>
            </div>
            <div className="body gut">
                <form className="w form" id="apForm" ref={formRef} noValidate onSubmit={handleSubmit}>
                    <h1 className="fq">{titles[step - 1][0]}</h1>
                    <p className="fqs">{titles[step - 1][1]}</p>
                    {err && <p className="note note-e" role="alert" style={{ marginBottom: 20 }}>{err}</p>}
                    {body}
                    <div className="fnav">
                        {step > 1
                            ? <button type="button" className="more" id="apPrev" style={{ flexDirection: 'row-reverse' }} onClick={prevStep}>이전 단계</button>
                            : <span />}
                        <button type="submit" className="pill pill-l" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9" /></svg>
                                    제출하는 중
                                </>
                            ) : step === TOTAL_STEPS ? '지원서 제출하기' : '계속'}
                        </button>
                    </div>
                </form>
            </div>
        </Shell>
    );
};

export default ApplicationPage;
