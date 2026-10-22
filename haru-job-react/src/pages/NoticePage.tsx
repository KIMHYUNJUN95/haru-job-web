import Shell from '../components/site/Shell';
import PageHead from '../components/site/PageHead';
import AccItem from '../components/site/Accordion';

interface NoticeItem {
    date: string;
    title: string;
    content: string;
    important?: boolean;
}

const noticeData: NoticeItem[] = [
    {
        date: '2026.03.01',
        title: '[안내] STAY ARI TOKYO 채용 사이트 오픈 및 3월 채용 시작',
        content: `안녕하세요. STAY ARI TOKYO입니다.

도쿄 신주쿠 지역을 중심으로 럭셔리 숙박 경험을 제공하는 STAY ARI TOKYO에서
2026년 3월부터 새로운 스태프 채용을 시작합니다.

저희와 함께 전 세계 여행자들에게 쾌적하고 잊지 못할 경험을 선사할
열정적인 분들의 많은 지원을 기다립니다.

자세한 채용 공고는 상단의 '채용공고' 메뉴에서 확인하실 수 있습니다.
감사합니다.`,
        important: true,
    },
    {
        date: '2026.08.18',
        title: '[채용] 객실 클리닝 스태프 모집 안내',
        content: `현재 STAY ARI TOKYO에서 '객실 클리닝 스태프'를 모집 중입니다.

■ 주요 업무
- 객실 클리닝 (메인 업무)
- 비품 관리 및 재고 파악
- 건물 관리
- 린넨 관리

■ 근무 조건
- 근무지: 신오쿠보 · 타카다노바바 · 아케보노바시 역세권
- 근무시간: 09:45 ~ 17:45 (하루 3~8시간 협의 가능)
- 근무형태: 주 2~5일 / 금·토·일·월 가능자 우대
- 시급: 1,350엔 시작 / 연수 후 1,500엔~2,200엔
- 교통비: 월 최대 15,000엔 지급

초보자도 지원 가능하며, 스마트폰 업무 앱 사용 가능자와 청소 경력자는 우대합니다.
상세 내용 확인 및 지원은 '채용공고' 메뉴를 이용해 주시기 바랍니다.`,
    },
    {
        date: '2026.03.01',
        title: '[필독] 지원서 접수 시 유의사항 안내',
        content: `STAY ARI TOKYO 채용 지원 시 다음 유의사항을 반드시 확인해 주시기 바랍니다.

1. 비자 요건
- 일본 내 취업 활동이 가능한 비자를 소지해야 합니다.
- 비자 만료일이 '3개월 이상' 남은 분만 지원 가능합니다. 
(3개월 미만인 경우 지원이 불가하오니 양해 부탁드립니다.)

2. 정보 기재
- 이름, 연락처(카카오톡 ID 필수), 비자 종류 및 만료일 등 필수 정보를 정확히 기재해 주세요.
- 허위 사실 기재 시 채용이 취소될 수 있습니다.

3. 면접 및 합격 안내
- 서류 심사 합격자에 한해 개별 연락(카카오톡)을 드리며, 대면 면접을 진행합니다.
- 불합격 처리 시 별도의 통보를 드리지 않는 점 양해 부탁드립니다.`,
        important: true,
    },
];

const NoticePage = () => (
    <Shell view="notice">
        <PageHead title="공지사항" sub="채용과 운영에 관한 안내입니다." />
        <div className="body gut">
            <div className="w">
                <div className="acc" data-in>
                    {noticeData.map((n, i) => (
                        <AccItem
                            key={i}
                            id={`n${i}`}
                            q={n.title}
                            a={n.content}
                            pre={<><span className="nd">{n.date}</span>{n.important && <span className="imp">중요</span>}</>}
                            defaultOpen={i === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    </Shell>
);

export default NoticePage;
