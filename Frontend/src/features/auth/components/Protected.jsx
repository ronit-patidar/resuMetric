import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react';

const Protected = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main className="loading-screen" role="status" aria-live="polite">
                <div className="spinner"></div>
                <h2>Verifying your session...</h2>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Protected;
