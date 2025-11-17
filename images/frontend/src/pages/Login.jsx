import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const clearMessages = () => {
		setMessage("");
		setError("");
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		clearMessages();

		try {
			const res = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || data.message || "Login mislukt");
				return;
			}

			if (data.token) {
				localStorage.setItem("token", data.token);
				setMessage(data.message || "Succesvol ingelogd");

				setTimeout(() => {
					window.location.href = "/home";
				}, 700);
			}
		} catch (err) {
			console.error(err);
			setError("Er ging iets mis bij het inloggen");
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				background: "#0f172a",
				color: "#e5e7eb",
				fontFamily: "system-ui",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			<header style={{ marginBottom: "2rem", textAlign: "center" }}>
				<h1 style={{ fontSize: "2.4rem", margin: 0 }}>
					Authentification System
				</h1>
			</header>

			<div
				style={{
					width: "100%",
					maxWidth: "600px",
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
				}}
			>
				{/* Messages */}
				{message && <div style={msgStyleSuccess}>{message}</div>}
				{error && <div style={msgStyleError}>{error}</div>}

				{/* Login Form */}
				<form
					onSubmit={handleLogin}
					style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
				>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={inputStyle}
					/>

					<input
						type="password"
						placeholder="Wachtwoord"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						style={inputStyle}
					/>

					<button type="submit" style={primaryButtonStyle}>
						Inloggen
					</button>
				</form>

				{/* Link to register */}
				<p style={{ textAlign: "center", color: "#9ca3af" }}>
					No account yet?{" "}
					<Link to="/" style={{ color: "#38bdf8" }}>
						Create one here
					</Link>
				</p>
			</div>
		</div>
	);
}

/* SAME STYLES AS BEFORE */

const inputStyle = {
	width: "100%",
	padding: "14px",
	borderRadius: "10px",
	border: "1px solid #374151",
	background: "#0f172a",
	color: "#e5e7eb",
	fontSize: "1rem",
};

const primaryButtonStyle = {
	width: "100%",
	padding: "14px",
	borderRadius: "10px",
	border: "none",
	cursor: "pointer",
	background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
	color: "#020617",
	fontWeight: "700",
	fontSize: "1rem",
	boxSizing: "border-box",
};

const msgStyleSuccess = {
	background: "#064e3b",
	border: "1px solid #10b981",
	color: "#d1fae5",
	padding: "12px",
	borderRadius: "10px",
	fontSize: "1rem",
};

const msgStyleError = {
	background: "#7f1d1d",
	border: "1px solid #f87171",
	color: "#fee2e2",
	padding: "12px",
	borderRadius: "10px",
	fontSize: "1rem",
};

export default Login;
