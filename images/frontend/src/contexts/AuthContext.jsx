import { createContext, useContext, useState, useEffect } from "react";
import { USER } from "../models/user";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			fetchUserProfile();
		} else {
			setLoading(false);
		}
	}, []);

	const fetchUserProfile = async () => {
		try {
			const token = localStorage.getItem("token");
			const API_URL = "http://localhost:3000";
			
			const res = await fetch(`${API_URL}/profile`, {
				headers: { "Content-Type": "application/json", token },
			});
			
			if (res.ok) {
				const data = await res.json();
				setUser(data.user);
			} else if (res.status === 410) {
				// Token expired or invalid - logout user
				console.log("Token expired, logging out user");
				logout();
			} else if (res.status === 401) {
				// Unauthorized - logout user
				console.log("Unauthorized, logging out user");
				logout();
			}
		} catch (error) {
			console.error("Failed to fetch user profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const login = (userData, token) => {
		setUser(userData);
		localStorage.setItem("token", token);
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("token");
	};

	const handleApiError = async (res) => {
		if (res.status === 410 || res.status === 401) {
			// Token expired or invalid - logout user
			console.log("Token expired/invalid, logging out user");
			logout();
			throw new Error("Session expired");
		}
		return res;
	};

	const isAdmin = user?.type === 0; // USER.ADMIN = 0
	const isClient = user?.type === 1; // USER.CLIENT = 1
	const isAuthenticated = !!user;

	// Debug logging
	console.log("Auth Debug:", { user, isAdmin, isClient, userType: user?.type });

	const value = {
		user,
		isAuthenticated,
		isAdmin,
		isClient,
		loading,
		login,
		logout,
		fetchUserProfile,
		handleApiError
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}