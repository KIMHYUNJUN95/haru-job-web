import { useParams } from 'react-router-dom';
import Shell from '../components/site/Shell';
import PageHead from '../components/site/PageHead';
import { ChevL } from '../components/site/icons';
import { useGo } from '../components/site/nav';
import { jobPostings, payLabel, recruitLine } from '../data/jobs';

type Section = { title: string; items: string[]; kind?: string };

const JobDetailPage = () => {
    const go = useGo();
    const { jobId } = useParams<{ jobId: string }>();
    const job = jobPostings.find(j => j.id === jobId);

    if (!job) {
        return (
            <Shell view="job">
                <PageHead title="이 공고를 찾을 수 없습니다" sub="마감되었거나 주소가 바뀌었을 수 있습니다." back={['jobs', '채용공고']} />
                <div className="body gut">
                    <div className="w">
                        <button className="pill pill-m" type="button" onClick={() => go('jobs')}>채용공고 목록으로</button>
                    </div>
                </div>
            </Shell>
        );
    }

    const badge = `badge${job.employmentType === 'full-time' ? ' ft' : ''}`;
    const apply = () => go(`apply:${job.id}`);
    const sections: Section[] = [
        { title: '지원 자격', items: job.requirements },
        { title: '근무 형태', items: job.workStyle },
        { title: '근무지역', items: job.locationDetails },
        { title: '급여 및 복리후생', items: job.benefits },
        ...(job.visaSupport ? [{ title: '비자 지원', items: job.visaSupport, kind: 'visa' }] : []),
        ...(job.applicationInfo ? [{ title: '지원 서류', items: job.applicationInfo }] : []),
        { title: '회사 소개', items: job.companyInfo },
    ];

    return (
        <Shell view="job">
            <div className="ph gut">
                <div className="w">
                    <button className="crumb" type="button" onClick={() => go('jobs')}><ChevL />채용공고</button>
                    <span className={badge} data-in>{job.type}</span>
                    <h1 className="h2" style={{ marginTop: 14 }}>{job.title}</h1>
                    <p className="sub2" data-in>{job.description}</p>
                </div>
            </div>

            <div className="body gut">
                <div className="w det">
                    <div>
                        <div className="facts3" data-in>
                            <div><span>근무지</span><b>{job.location}</b></div>
                            <div><span>{payLabel(job)}</span><b>{job.salary}</b></div>
                            <div><span>근무 시간</span><b>{job.workTime}</b></div>
                        </div>

                        <section className="blk" data-in>
                            <h3>주요 업무</h3>
                            <ul>
                                {job.tasks.map((t, i) => (
                                    <li key={t}>
                                        <span>{t}{job.employmentType === 'part-time' && i === 0 && <span className="mainb">메인</span>}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {sections.map(s => (
                            <section key={s.title} className={`blk${s.kind ? ' ' + s.kind : ''}`} data-in>
                                <h3>{s.title}</h3>
                                <ul>{s.items.map(x => <li key={x}>{x}</li>)}</ul>
                                {s.title === '회사 소개' && job.companyWebsite && (
                                    <p style={{ marginTop: 16 }}>
                                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">회사 홈페이지에서 객실과 시설 보기 ›</a>
                                    </p>
                                )}
                            </section>
                        ))}
                    </div>

                    <aside className="side">
                        <span className={badge} style={{ alignSelf: 'flex-start' }}>{job.type}</span>
                        <p style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em' }}>{job.title}</p>
                        <p style={{ color: 'var(--fg-3)', fontSize: 15 }}>{job.salary}</p>
                        <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>{recruitLine(job)}</p>
                        <button className="pill pill-m" type="button" onClick={apply}>지원하기</button>
                        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>지원서는 4단계로 나뉘어 있어요.</p>
                    </aside>
                </div>
            </div>

            <div className="mbar">
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>{job.salary}</p>
                </div>
                <button className="pill pill-m" type="button" onClick={apply}>지원하기</button>
            </div>
        </Shell>
    );
};

export default JobDetailPage;
