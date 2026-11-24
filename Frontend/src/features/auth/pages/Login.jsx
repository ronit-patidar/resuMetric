import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { toast } from 'react-toastify'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { user, loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    // Redirect to home if user is already authenticated
    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim() || !password.trim()) {
            toast.warning("Please provide both email and password")
            return
        }

        setIsSubmitting(true)
        const result = await handleLogin({ email: email.trim(), password })
        setIsSubmitting(false)

        if (result?.success) {
            toast.success(result.data?.message || "Logged in successfully!")
            navigate('/', { replace: true })
        } else {
            toast.error(result?.message || "Failed to log in. Please check your credentials.")
        }
    }

    if (loading && !isSubmitting) {
        return (
            <main className="auth-loading" role="status" aria-live="polite">
                <div className="spinner"></div>
                <h2>Loading your session...</h2>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div className="auth-header">
                    <div className="auth-brand-badge">
                        <span>🎯</span> resuMetric
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Log in to access your AI interview preparation dashboard</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`button primary-button auth-submit-btn ${isSubmitting ? 'is-loading' : ''}`}
                    >
                        <span>{isSubmitting ? "Signing you in..." : "Login to dashboard"}</span>
                        {!isSubmitting && <span className="auth-submit-arrow" aria-hidden="true">→</span>}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
