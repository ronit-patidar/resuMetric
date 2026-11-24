import { createContext, useState, useEffect } from "react";
import { login, register, logout, getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Invalid credentials. Please try again.";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            setUser(data.user);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Registration failed. Please try again.";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const data = await logout();
            setUser(null);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Logout failed.";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (isMounted) {
                    setUser(data.user);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getAndSetUser();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                handleLogin,
                handleRegister,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
