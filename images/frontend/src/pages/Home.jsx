import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Home() {
	const token = localStorage.getItem("token");
	const [user, setUser] = useState(null);
	const [profileError, setProfileError] = useState("");

	// Redirect + profiel ophalen
	useEffect(() => {
		if (!token) {
			window.location.href = "/login";
			return;
		}
		fetchProfile();
	}, [token]);

	const fetchProfile = async () => {
		try {
			const res = await fetch(`${API_URL}/profile`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				setProfileError(data.error || "Kon profiel niet ophalen");
				setUser(null);
				return;
			}

			setUser(data.user || null);
		} catch (err) {
			console.error(err);
			setProfileError("Er ging iets mis bij het ophalen van je profiel");
		}
	};

	// Geen token? Niks renderen (useEffect doet redirect)
	if (!token) return null;

	const initial =
		user && user.username ? user.username.trim().charAt(0).toUpperCase() : "U";

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				background: "#f0f0f0",
				padding: "2rem",
				boxSizing: "border-box",
				fontFamily: "system-ui",
			}}
		>
			{/* HEADER */}
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "2rem",
				}}
			>
				<h1 style={{ fontSize: "2rem", margin: 0, color: "#111827" }}>
					Webshop
				</h1>

				{/* AVATAR CIRCLE */}
				<div
					onClick={() => (window.location.href = "/profile")}
					style={{
						width: "40px",
						height: "40px",
						borderRadius: "999px",
						background: "radial-gradient(circle at 30% 30%, #22c55e, #0ea5e9)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "1.1rem",
						fontWeight: 700,
						color: "#020617",
						cursor: "pointer",
						boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
					}}
					title={
						user
							? `${user.username} – klik om naar je profiel te gaan`
							: "Naar profiel"
					}
				>
					{initial}
				</div>
			</header>

			{/* Kleine hint / error (optioneel) */}
			{profileError && (
				<p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{profileError}</p>
			)}

			{/* Hier komt later je webshop-grid met producten */}
		</div>
	);
}

export default Home;
