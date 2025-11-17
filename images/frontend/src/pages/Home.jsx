import { useState } from "react";

function Home() {
	const token = localStorage.getItem("token");

	// Gebruiker niet ingelogd → redirect
	if (!token) {
		window.location.href = "/";
		return null;
	}

	const [open, setOpen] = useState(false);

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

				{/* ACCOUNT BUTTON */}
				<div style={{ position: "relative" }}>
					<button
						onClick={() => setOpen(!open)}
						style={{
							padding: "10px 16px",
							background: "#0ea5e9",
							border: "none",
							borderRadius: "8px",
							color: "white",
							cursor: "pointer",
							fontWeight: 600,
						}}
					>
						Account
					</button>

					{/* DROPDOWN */}
					{open && (
						<div
							style={{
								position: "absolute",
								top: "48px",
								right: 0,
								background: "white",
								borderRadius: "10px",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								minWidth: "160px",
								overflow: "hidden",
							}}
						>
							<button
								onClick={() => {
									window.location.href = "/profile";
								}}
								style={{
									width: "100%",
									padding: "12px",
									background: "white",
									border: "none",
									textAlign: "left",
									cursor: "pointer",
								}}
							>
								Mijn account
							</button>

							<button
								onClick={() => {
									localStorage.removeItem("token");
									window.location.href = "/login";
								}}
								style={{
									width: "100%",
									padding: "12px",
									background: "#fee2e2",
									border: "none",
									textAlign: "left",
									cursor: "pointer",
									color: "#b91c1c",
									fontWeight: 600,
								}}
							>
								Uitloggen
							</button>
						</div>
					)}
				</div>
			</header>
		</div>
	);
}

export default Home;
