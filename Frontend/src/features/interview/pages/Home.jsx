import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedResume, setSelectedResume ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ isGenerating, setIsGenerating ] = useState(false)
    const resumeInputRef = useRef(null)

    const navigate = useNavigate()

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 KB"
        const k = 1024
        const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[ i ]
    }

    const processSelectedFile = (file) => {
        if (!file) return

        const validTypes = [ 'application/pdf' ]
        const validExtensions = [ '.pdf' ]
        const fileName = file.name.toLowerCase()
        const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext))

        if (!validTypes.includes(file.type) && !hasValidExt) {
            toast.error("Please upload a valid PDF resume.")
            return
        }

        const maxSizeBytes = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSizeBytes) {
            toast.error("File size exceeds 5MB limit. Please choose a smaller file.")
            return
        }

        setSelectedResume(file)
        toast.success(`Resume "${file.name}" uploaded successfully!`)
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[ 0 ]
        if (file) {
            processSelectedFile(file)
        }
    }

    const handleRemoveFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedResume(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
        toast.info("Resume file removed.")
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        const file = e.dataTransfer?.files?.[ 0 ]
        if (file) {
            processSelectedFile(file)
        }
    }

    const handleGenerateReport = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please enter the Target Job Description.")
            return
        }

        if (!selectedResume && !selfDescription.trim()) {
            toast.error("Please upload your resume or provide a quick self-description.")
            return
        }

        setIsGenerating(true)
        const toastId = toast.loading("Analyzing profile & generating interview strategy...")

        const result = await generateReport({
            jobDescription: jobDescription.trim(),
            selfDescription: selfDescription.trim(),
            resumeFile: selectedResume
        })

        setIsGenerating(false)

        if (result?.success && result?.data?._id) {
            toast.update(toastId, {
                render: "Interview strategy generated successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2500
            })
            navigate(`/interview/${result.data._id}`)
        } else {
            toast.update(toastId, {
                render: result?.message || "Failed to generate interview strategy. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 4000
            })
        }
    }

    const onLogout = async () => {
        const res = await handleLogout()
        if (res?.success) {
            toast.success("Logged out successfully")
            navigate('/login')
        }
    }

    if (loading && !isGenerating) {
        return (
            <main className='loading-screen'>
                <div className='spinner'></div>
                <h1>Loading your interview dashboard...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Top Navigation Bar */}
            <nav className='top-navbar'>
                <div className='nav-brand'>
                    <span className='brand-icon'>🎯</span>
                    <span className='brand-title'>resuMetric</span>
                </div>
                {user && (
                    <div className='nav-user-actions'>
                        <span className='user-greeting'>Hi, <strong>{user.username}</strong></span>
                        <button onClick={onLogout} className='logout-btn' title='Sign out'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical / Responsive Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            <label
                                className={`dropzone ${isDragging ? 'dropzone--dragging' : ''} ${selectedResume ? 'dropzone--has-file' : ''}`}
                                htmlFor='resume'
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {selectedResume ? (
                                    <div className='dropzone__file-info'>
                                        <div className='file-icon-wrap'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                        </div>
                                        <div className='file-details'>
                                            <p className='file-name' title={selectedResume.name}>{selectedResume.name}</p>
                                            <p className='file-size'>{formatFileSize(selectedResume.size)} &bull; Attached</p>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={handleRemoveFile}
                                            className='file-remove-btn'
                                            title='Remove resume'
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF (Max 5MB)</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    onChange={handleFileChange}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf'
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        {isGenerating ? "Analyzing & Generating..." : "Generate My Interview Strategy"}
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <div className='report-item__top'>
                                    <h3>{report.title || 'Target Role Plan'}</h3>
                                    <span className={`match-score-badge ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                        {report.matchScore}% Match
                                    </span>
                                </div>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <span className='report-arrow'>View Plan &rarr;</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home
