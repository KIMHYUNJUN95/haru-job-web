import Shell from '../components/site/Shell';
import PageHead from '../components/site/PageHead';
import { ChevR } from '../components/site/icons';
import { useGo } from '../components/site/nav';
import { jobPostings, payLabel } from '../data/jobs';


const JobListingsPage = () => {
    const go = useGo();
    const activeJobs = jobPostings.filter(j => j.active);

    return (
        <Shell view="jobs">
            <PageHead title="채용공고" sub={<>지금 <b>{activeJobs.length}개 포지션</b>을 모집하고 있어요.</>} />
            <div className="body gut">
                <div className="w">
                    {activeJobs.length ? activeJobs.map(j => (
                        <button key={j.id} className="jrow" type="button" onClick={() => go(`job:${j.id}`)} data-in>
                            <div>
                                <span className={`badge${j.employmentType === 'full-time' ? ' ft' : ''}`}>{j.type}</span>
                                <h2>{j.title}</h2>
                                <p>{j.description}</p>
                                <div className="jmeta">
                                    <span>근무지<b>{j.location}</b></span>
                                    <span>{payLabel(j)}<b>{j.salary}</b></span>
                                    <span>근무 시간<b>{j.workTime}</b></span>
                                </div>
                                <div className="jmeta" style={{ marginTop: 10 }}>
                                    {j.tags.map(t => <span key={t}>#{t}</span>)}
                                </div>
                            </div>
                            <span className="chev" aria-hidden="true"><ChevR /></span>
                        </button>
                    )) : (
                        <div className="empty">
                            <p style={{ fontSize: 24, fontWeight: 700 }}>지금은 모집 중인 공고가 없습니다</p>
                            <p style={{ color: 'var(--fg-3)', margin: '8px 0 20px' }}>새 공고가 올라오면 이 페이지에 바로 표시됩니다.</p>
                            <button className="more" type="button" onClick={() => go('notice')}>공지사항 보기</button>
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
};

export default JobListingsPage;
