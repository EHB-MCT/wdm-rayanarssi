import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const clearMessages = () => {
		setMessage("");
		setError("");
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		clearMessages();

		try {
			const res = await fetch(`${API_URL}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Registratie mislukt");
				return;
			}

			// Success message
			setMessage("Account succesvol aangemaakt!");

			// After 1 sec → redirect to login page
			setTimeout(() => {
				window.location.href = "/login";
			}, 1000);
		} catch (err) {
			setError("Er ging iets mis bij het registreren");
			console.log(err);
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				background: "#0f172a",
				color: "#e5e7eb",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "system-ui",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			<div style={{ width: "100%", maxWidth: "600px" }}>
				<h1 style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>
					Maak u account aan!
				</h1>

				{message && <div style={msgStyleSuccess}>{message}</div>}
				{error && <div style={msgStyleError}>{error}</div>}

				<form
					style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
					onSubmit={handleRegister}
				>
					<input
						type="text"
						placeholder="Username"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						style={inputStyle}
					/>

					<input
						type="email"
						placeholder="Email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						style={inputStyle}
					/>

					<input
						type="password"
						placeholder="Wachtwoord"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={inputStyle}
					/>

					<button type="submit" style={primaryButtonStyle}>
						Account aanmaken
					</button>

					<p style={{ marginTop: "1rem", color: "#9ca3af" }}>
						Al een account?{" "}
						<Link to="/login" style={{ color: "#38bdf8" }}>
							Log hier in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

/* SHARED STYLES */
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
	width: "105%",
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

export default Register;
