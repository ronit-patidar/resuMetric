import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useAuth } from '../../auth/hooks/useAuth.js'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div
                className='q-card__header'
                onClick={() => setOpen(o => !o)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setOpen(o => !o)
                    }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={open}
            >
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    <span>{task}</span>
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ isDownloading, setIsDownloading ] = useState(false)
    const { report, loading, getResumePdf } = useInterview()
    const { handleLogout } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    const handleLogoutClick = async () => {
        const result = await handleLogout()
        if (result?.success) {
            toast.success('Logged out successfully')
            navigate('/login', { replace: true })
        } else {
            toast.error(result?.message || 'Logout failed. Please try again.')
        }
    }

    const handleDownloadResume = async () => {
        if (!interviewId) return
        setIsDownloading(true)
        const toastId = toast.loading("Generating your optimized resume PDF...")

        const result = await getResumePdf(interviewId)
        setIsDownloading(false)

        if (result?.success) {
            toast.update(toastId, {
                render: "Resume PDF downloaded successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            })
        } else {
            toast.update(toastId, {
                render: result?.message || "Failed to download resume PDF. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 4000
            })
        }
    }

    if (loading || !report) {
        return (
            <main className='loading-screen' role="status" aria-live="polite">
                <div className='spinner'></div>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            {/* Top Responsive Header */}
            <header className='interview-topbar'>
                <div className='interview-topbar__left'>
                    <button onClick={() => navigate('/')} className='back-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Dashboard</span>
                    </button>
                </div>

                <div className='interview-topbar__title'>
                    <h2>{report.title || 'Interview Preparation Plan'}</h2>
                    <span className='interview-topbar__badge'>Plan Overview</span>
                </div>

                <div className='interview-topbar__actions'>
                    <button
                        onClick={handleDownloadResume}
                        disabled={isDownloading}
                        className='button primary-button download-btn-header'
                        title="Download tailored resume PDF"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>{isDownloading ? "Downloading..." : "Download Resume"}</span>
                    </button>
                    <button onClick={handleLogoutClick} className='logout-btn' title='Sign out'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className='interview-layout'>

                {/* ── Left Nav / Section Tabs ── */}
                <nav className='interview-nav' aria-label="Interview Plan Sections">
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        <div className='nav-items-group' role="tablist">
                            {NAV_ITEMS.map(item => {
                                const count = item.id === 'technical'
                                    ? (report.technicalQuestions?.length || 0)
                                    : item.id === 'behavioral'
                                    ? (report.behavioralQuestions?.length || 0)
                                    : (report.preparationPlan?.length || 0)

                                return (
                                    <button
                                        key={item.id}
                                        role="tab"
                                        aria-selected={activeNav === item.id}
                                        className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                        onClick={() => setActiveNav(item.id)}
                                    >
                                        <span className='interview-nav__icon'>{item.icon}</span>
                                        <span className='interview-nav__text'>{item.label}</span>
                                        <span className='interview-nav__item-count'>{count}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content' role="tabpanel">
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Technical Questions</h2>
                                    <p className='content-header__sub'>Core concepts and technical scenarios relevant to the role</p>
                                </div>
                                <span className='content-header__count'>{report.technicalQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions && report.technicalQuestions.length > 0 ? (
                                    report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))
                                ) : (
                                    <div className='empty-state'>
                                        <p className='empty-state-text'>No technical questions generated for this report.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Behavioral Questions</h2>
                                    <p className='content-header__sub'>Situational, leadership, and collaboration prompts with model responses</p>
                                </div>
                                <span className='content-header__count'>{report.behavioralQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions && report.behavioralQuestions.length > 0 ? (
                                    report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))
                                ) : (
                                    <div className='empty-state'>
                                        <p className='empty-state-text'>No behavioral questions generated for this report.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <div>
                                    <h2>Preparation Road Map</h2>
                                    <p className='content-header__sub'>Day-by-day targeted study and practice schedule</p>
                                </div>
                                <span className='content-header__count'>{report.preparationPlan?.length || 0}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan && report.preparationPlan.length > 0 ? (
                                    report.preparationPlan.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))
                                ) : (
                                    <div className='empty-state'>
                                        <p className='empty-state-text'>No preparation plan roadmap generated for this report.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider sidebar-divider-vertical' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className={`match-score__sub ${scoreColor}`}>
                            {report.matchScore >= 80 ? 'Strong match for this role' :
                             report.matchScore >= 60 ? 'Moderate match - review gaps' :
                             'Needs preparation for key skills'}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Identified Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps && report.skillGaps.length > 0 ? (
                                report.skillGaps.map((gap, i) => (
                                    <span key={i} className={`skill-tag skill-tag--${gap.severity || 'low'}`}>
                                        <span className='skill-tag__dot' />
                                        <span>{gap.skill}</span>
                                    </span>
                                ))
                            ) : (
                                <p className='no-gaps-text'>No significant skill gaps detected!</p>
                            )}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview
