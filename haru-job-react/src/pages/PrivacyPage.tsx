import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#f8f8f6] font-sans">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> 돌아가기
                    </button>
                    <span className="text-[15px] font-bold tracking-tight text-[#212322]">Stay Ari Tokyo</span>
                    <div className="w-20" />
                </div>
            </nav>

            <div className="pt-28 pb-20 px-6 max-w-[900px] mx-auto">
                <h1 className="text-3xl font-extrabold text-[#111] tracking-tight mb-3">개인정보 처리방침</h1>
                <p className="text-gray-400 text-sm font-medium mb-12">최종 수정일: 2026년 3월 1일</p>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8 md:p-12 space-y-10 text-[14px] text-gray-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">1. 수집하는 개인정보 항목</h2>
                        <p>회사는 채용 지원 접수를 위해 다음의 개인정보를 수집합니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li><strong>필수 항목:</strong> 이름, 나이, 성별, 연락처(휴대폰), 거주지, 카카오톡 ID</li>
                            <li><strong>선택 항목:</strong> 국적, 비자 종류 및 만료일, 유니폼 사이즈, 출퇴근 소요 시간, 경력 사항, 이력서 파일</li>
                        </ul>
                        <p className="mt-3">또한, 서비스 이용 과정에서 다음의 정보가 자동으로 수집될 수 있습니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1.5">
                            <li>접속 IP 주소, 브라우저 종류, 접속 일시, 방문 페이지 기록</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">2. 개인정보의 수집 방법</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>사이트 내 지원서 작성 양식을 통한 직접 수집</li>
                            <li>이력서 파일 첨부를 통한 수집</li>
                            <li>쿠키 및 웹 분석 도구를 통한 자동 수집</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">3. 개인정보의 수집 및 이용 목적</h2>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>채용 지원서 접수 및 서류 심사</li>
                            <li>지원자와의 연락 및 면접 일정 조율</li>
                            <li>채용 관련 안내 및 합격/불합격 통보</li>
                            <li>근무 배정을 위한 기초 정보 확인</li>
                            <li>서비스 이용 통계 분석 및 사이트 개선</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">4. 개인정보의 보유 및 이용 기간</h2>
                        <p>수집된 개인정보는 채용 절차 완료 후 <strong>6개월간</strong> 보유하며, 보유 기간 경과 시 지체 없이 파기합니다.</p>
                        <p className="mt-2">다만, 다음의 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1.5">
                            <li>근로기준법에 따른 채용 관련 기록: 3년</li>
                            <li>개인정보보호법에 따른 접속 기록: 최소 6개월</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">5. 개인정보의 제3자 제공</h2>
                        <p>회사는 지원자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li>지원자가 사전에 동의한 경우</li>
                            <li>법령에 의해 요구되는 경우</li>
                            <li>수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">6. 개인정보 처리 위탁</h2>
                        <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-[13px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 font-bold text-[#111] border border-gray-100">위탁 업체</th>
                                        <th className="text-left p-3 font-bold text-[#111] border border-gray-100">위탁 업무</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-3 border border-gray-100">Google LLC (Firebase)</td>
                                        <td className="p-3 border border-gray-100">지원서 데이터 저장, 이력서 파일 저장, 웹 호스팅, 방문자 분석</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">7. 쿠키 및 분석 도구 사용</h2>
                        <p>회사는 사이트 이용 현황 분석 및 서비스 개선을 위해 다음의 분석 도구를 사용합니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li><strong>Google Analytics (Firebase)</strong>: 방문자 수, 페이지 조회 수, 체류 시간 등 익명화된 통계 데이터를 수집합니다.</li>
                        </ul>
                        <p className="mt-3">지원자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">8. 개인정보의 파기 절차 및 방법</h2>
                        <p>회사는 보유 기간이 경과하거나 처리 목적이 달성된 개인정보를 다음과 같이 파기합니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li><strong>전자적 파일:</strong> 복구 불가능한 방법으로 영구 삭제</li>
                            <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">9. 개인정보의 안전성 확보 조치</h2>
                        <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li><strong>관리적 조치:</strong> 개인정보 취급 직원의 최소화 및 교육</li>
                            <li><strong>기술적 조치:</strong> 데이터 전송 시 SSL/TLS 암호화 적용, Firebase 보안 규칙을 통한 접근 권한 관리</li>
                            <li><strong>물리적 조치:</strong> 개인정보가 포함된 서류 및 저장 매체의 잠금 장치 보관</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">10. 지원자의 권리 및 행사 방법</h2>
                        <p>지원자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
                        <ul className="list-disc pl-5 mt-3 space-y-1.5">
                            <li>개인정보 열람 요청</li>
                            <li>오류 등이 있을 경우 정정 요청</li>
                            <li>삭제 요청</li>
                            <li>처리 정지 요청</li>
                        </ul>
                        <p className="mt-3">위 권리 행사는 담당자에게 카카오톡으로 연락하시면 지체 없이 처리하겠습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">11. 개인정보 보호 책임자</h2>
                        <p>개인정보 보호와 관련한 문의 사항은 아래 연락처로 문의해 주시기 바랍니다.</p>
                        <div className="mt-3 bg-gray-50 rounded-xl p-5 text-[13px]">
                            <p><strong>회사명:</strong> STAY ARI TOKYO</p>
                            <p className="mt-1"><strong>소재지:</strong> 〒162-0065 東京都 新宿区 住吉町 2-10 7階</p>
                            <p className="mt-1"><strong>연락:</strong> 카카오톡을 통한 문의</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-extrabold text-[#111] mb-4">12. 처리방침의 변경</h2>
                        <p>본 개인정보 처리방침은 법령, 정책 또는 회사 내부 방침의 변경에 따라 수정될 수 있습니다. 변경 시에는 사이트를 통해 공지하며, 변경된 처리방침은 공지한 날로부터 효력이 발생합니다.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
