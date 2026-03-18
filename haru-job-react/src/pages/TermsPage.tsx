import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#f8f8f6] font-sans">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> 돌아가기
                    </button>
                    <p className="text-[#666] leading-relaxed mb-6">Welcome to STAY ARI TOKYO. By accessing or using our services, you agree to be bound by the following terms and conditions.</p>
                    <div className="w-20" />
                </div>
            </nav>

            <div className="pt-28 pb-20 px-6 max-w-[900px] mx-auto">
                <h1 className="text-3xl font-extrabold text-[#111] tracking-tight mb-3">이용약관</h1>
                <p className="text-gray-400 text-sm font-medium mb-12">최종 수정일: 2026년 3월 1일</p>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8 md:p-12 space-y-10 text-[14px] text-gray-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제1조 (목적)</h2>
                        <p>본 약관은 STAY ARI TOKYO(이하 "회사")가 운영하는 채용 웹사이트(이하 "사이트")에서 제공하는 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제2조 (용어의 정의)</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><strong>"사이트"</strong>란 회사가 채용 목적으로 운영하는 웹사이트(stayari.web.app)를 말합니다.</li>
                            <li><strong>"지원자"</strong>란 본 사이트를 통해 채용에 지원하는 모든 이용자를 말합니다.</li>
                            <li><strong>"서비스"</strong>란 회사가 사이트를 통해 제공하는 채용 관련 일체의 기능을 말합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제3조 (서비스의 내용)</h2>
                        <p>회사는 본 사이트를 통해 다음과 같은 서비스를 제공합니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li>숙박 시설 관리 업무 관련 채용 공고 안내</li>
                            <li>온라인 입사 지원서 접수</li>
                            <li>이력서 및 관련 서류 첨부 기능</li>
                            <li>자주 묻는 질문(FAQ) 및 공지사항 안내</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제4조 (이용 계약의 성립)</h2>
                        <p>지원자가 본 사이트에 접속하여 지원서를 제출하는 시점에 본 약관에 동의한 것으로 간주하며, 이로써 이용 계약이 성립됩니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제5조 (지원자의 의무)</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>지원자는 정확하고 사실에 기반한 정보를 제공해야 합니다.</li>
                            <li>허위 정보 기재 시 채용이 취소될 수 있으며, 이에 대한 책임은 지원자에게 있습니다.</li>
                            <li>타인의 개인정보를 도용하여 지원하는 행위를 금지합니다.</li>
                            <li>지원자는 사이트의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제6조 (회사의 의무)</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>회사는 관련 법령과 본 약관에 반하는 행위를 하지 않으며, 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
                            <li>회사는 지원자의 개인정보를 보호하기 위해 개인정보 처리방침에 따라 적절한 조치를 취합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제7조 (채용 절차)</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>지원서 접수 후 서류 심사를 거쳐 합격자에 한해 별도 연락을 드립니다.</li>
                            <li>채용 불가 판정 시에는 별도의 통보를 하지 않을 수 있습니다.</li>
                            <li>회사는 채용 일정 및 절차를 사전 고지 없이 변경할 수 있습니다.</li>
                            <li>회사는 특정 지원자의 채용을 거부할 권리를 보유하며, 그 사유를 공개할 의무를 지지 않습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제8조 (지적재산권)</h2>
                        <p>본 사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 디자인, 로고 등)에 대한 지적재산권은 회사에 귀속됩니다. 회사의 사전 서면 동의 없이 이를 복제, 배포, 가공하는 행위는 금지됩니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제9조 (서비스 변경 및 중단)</h2>
                        <p>회사는 운영상 또는 기술적 필요에 따라 사이트 서비스를 변경하거나 중단할 수 있으며, 이에 대해 사전 고지할 수 있습니다. 서비스 중단으로 인한 지원자의 손해에 대해 회사는 별도의 배상 의무를 지지 않습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제10조 (면책 조항)</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>회사는 천재지변, 시스템 장애, 해킹 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                            <li>지원자의 귀책 사유로 인한 서비스 이용 장애 및 개인정보 유출에 대해 회사는 책임을 지지 않습니다.</li>
                            <li>회사는 지원자가 사이트에 게시한 정보의 신뢰도 및 정확성에 대해 보증하지 않습니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제11조 (약관의 변경)</h2>
                        <p>회사는 필요에 따라 본 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지한 시점부터 효력이 발생합니다. 변경 사항이 지원자에게 불리한 경우, 최소 7일 전에 사이트를 통해 공지합니다. 변경된 약관에 동의하지 않는 경우, 지원자는 서비스 이용을 중단할 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">제12조 (준거법 및 관할 법원)</h2>
                        <p>본 약관의 해석 및 적용에 관하여는 일본국 법률을 준거법으로 합니다. 본 서비스와 관련하여 발생하는 모든 분쟁에 대해서는 도쿄 지방재판소(東京地方裁判所)를 제1심 전속 관할 법원으로 합니다.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
