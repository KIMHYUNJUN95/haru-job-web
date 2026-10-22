/* Job postings: single source of truth for the listing, detail and application pages. */

export interface JobPosting {
    id: string;
    title: string;
    location: string;
    salary: string;
    workTime: string;
    type: string;
    tags: string[];
    description: string;
    tasks: string[];
    requirements: string[];
    workStyle: string[];
    locationDetails: string[];
    benefits: string[];
    companyInfo: string[];
    employmentType: 'part-time' | 'full-time';
    applicationPositions?: string[];
    visaSupport?: string[];
    applicationInfo?: string[];
    companyWebsite?: string;
    active: boolean;
}

/** Pay label shown next to the salary: 시급 for part-time, 월급 for full-time. */
export const payLabel = (j: JobPosting) => (j.employmentType === 'full-time' ? '월급' : '시급');

/** Short recruiting line for the apply card, e.g. "아르바이트 10명 모집 · 채용 시 조기 마감". */
export const recruitLine = (j: JobPosting) => j.requirements[0].replace(/\s*\((.+)\)$/, ' · $1');

export const jobPostings: JobPosting[] = [
    {
        id: 'cleaning-staff',
        title: '객실 클리닝 스태프',
        location: '신오쿠보 · 타카다노바바 · 아케보노바시 역세권',
        salary: '¥1,350 시작 · 연수 후 ¥1,500~¥2,200',
        workTime: '09:45 ~ 17:45',
        type: '아르바이트',
        tags: ['클리닝', '역세권', '초보 가능'],
        description: '신주쿠 지역 아파트먼트 호텔 STAY ARI에서 객실 클리닝 업무를 함께할 스태프를 모집합니다. 연수 후 시급 인상 구조와 안정적인 팀 운영이 강점입니다.',
        tasks: [
            '객실 클리닝 (메인 업무)',
            '비품 관리 및 재고 파악',
            '건물 관리',
            '린넨 관리',
        ],
        requirements: [
            '아르바이트 10명 모집 (채용 시 조기 마감)',
            '20세~60세 지원 가능',
            '스마트폰 업무 앱 사용 가능자 우대',
            '청소 경력자 우대',
            '책임감 있고 꼼꼼한 분 환영',
        ],
        workStyle: [
            '주 2~5일 근무 (일정 및 요일 협의 가능)',
            '금·토·일·월 근무 가능자 우대',
            '하루 3~8시간 협의 가능',
            '연장근무 시 1분 단위 초과근무수당 지급',
        ],
        locationDetails: [
            'Akebonobashi A · B: 아케보노바시역 도보 3분',
            'Kabukicho · Shin-Okubo: 히가시신주쿠역 도보 5분',
            'Kabukicho · Shin-Okubo: 신오쿠보역 도보 8분',
            'Kabukicho · Shin-Okubo: 세이부신주쿠역 도보 5분',
            'Takadanobaba: 타카다노바바역 도보 10분',
        ],
        benefits: [
            '시급 1,350엔부터 시작',
            '연수(1~3개월) 종료 후 시급 1,500엔',
            '업무 능력에 따라 최대 시급 2,200엔',
            '특정 지정일 근무 시 시급 +100~300엔 추가 지급',
            '교통비 월 최대 15,000엔 지급',
        ],
        companyInfo: [
            '신주쿠 지역 아파트먼트 호텔 전문 운영',
            '직원 및 아르바이트 40명 이상 근무',
            '900㎡ 규모 신규 호텔 오픈 예정',
            '지속적으로 성장 중인 운영사',
        ],
        employmentType: 'part-time',
        active: true,
    },
    {
        id: 'full-time-staff',
        title: 'STAY ARI 사무직·현장직 정사원',
        location: '아케보노바시역 도보 1분 · 신주쿠구 내',
        salary: '월 ¥240,000~ (경력직 협의)',
        workTime: '09:00 ~ 18:00',
        type: '정사원',
        tags: ['비자 지원', '주 5일', '상여금'],
        description: '사업 확장과 신규 호텔 오픈에 따라 STAY ARI와 함께 성장할 정사원을 모집합니다. 사무직과 현장직에서 장기적으로 안정적인 근무를 희망하는 분을 기다립니다.',
        tasks: [
            '운영 매니저: 사이트 관리, 사무 서류 정리, 아르바이트 근태 관리 및 현장 지원',
            '브랜딩·마케팅 담당자: Instagram, Threads, YouTube 등 SNS 운영',
            '클리닝 매니저: 점포별 클리닝, 현장 운영 및 아르바이트 관리',
        ],
        requirements: [
            '정사원 5명 모집 (채용 시 조기 마감)',
            '20세~60세 지원 가능',
            '일본어 N2 이상 필수, 영어 가능자 우대',
            '현재 일본에 거주하며 유효한 재류자격을 보유한 분',
            '관광비자 또는 현재 한국 거주자는 지원이 어렵습니다',
        ],
        workStyle: [
            '6개월 연수 후 정직원 전환',
            '주 5일 근무',
            '토·일·공휴일 휴무',
            '09:00~18:00 근무 (휴게시간 1시간 포함)',
        ],
        locationDetails: [
            '사무직: 아케보노바시역 도보 1분',
            '현장직: 신주쿠구 내 면담 후 배정',
        ],
        benefits: [
            '월 급여 240,000엔부터 (경력직 협의)',
            '4대 보험 가입',
            '연 1~2회 상여금 지급',
            '입사 6개월 후 연차 10일 지급 (이후 매년 1일 증가)',
            '생일 상품권 지급',
            '교통비 월 최대 15,000엔 지급',
            '유니폼 지급',
        ],
        companyInfo: [
            '신주쿠 지역 아파트먼트 호텔 전문 운영',
            '약 400명 수용 가능한 숙박시설 운영',
            '직원 및 아르바이트 40명 이상 근무',
            '신오쿠보 지역 900㎡ 규모 신규 호텔 오픈 예정',
        ],
        employmentType: 'full-time',
        applicationPositions: ['운영 매니저', '브랜딩·마케팅 담당자', '클리닝 매니저'],
        visaSupport: [
            '비자 만료일까지 6개월 이상 남아 있고 비자 결격사유가 없는 분',
            '연수 종료 후 정직원 전환 시 비자 발급 지원',
            '지원 가능 비자: 인문지식·국제업무, 특정기능',
        ],
        applicationInfo: [
            '사진이 첨부된 이력서 필수',
            '현재 재류자격 및 남은 기간 기재',
            '입사 가능일 기재',
            '본인이 자신 있는 업무 기재',
        ],
        companyWebsite: 'https://haru-stay.com/ko',
        active: true,
    },
    // 추후 채용 공고 추가 시 여기에 추가
];
