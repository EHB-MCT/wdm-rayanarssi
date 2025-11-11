import { useEffect, useState } from "react";

function App() {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Use env var from Docker / Vite
	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

	// fetch(`${apiBaseUrl}/profile`, {
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 		token: localStorage.getItem("token") ?? null, // Replace with a valid token
	// 	},
	// });
	useEffect(() => {
		const fetchComments = async () => {
			try {
				const res = await fetch(`${apiBaseUrl}/comments`);
				const data = await res.json();
				setComments(data);
			} catch (err) {
				console.error(err);
				setError("Failed to load data from backend");
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, [apiBaseUrl]);

	return (
		<div
			style={{
				minHeight: "100vh",
				padding: "2rem",
				fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
				background: "#0f172a",
				color: "#e5e7eb",
			}}
		>
			<h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
				DEV5 – Frontend with React + Vite
			</h1>
			<p style={{ marginBottom: "1rem" }}>
				Backend API URL: <code>{apiBaseUrl}</code>
			</p>

			{loading && <p>Loading comments from backend…</p>}
			{error && <p style={{ color: "#f97373" }}>{error}</p>}

			{!loading && !error && (
				<>
					<p style={{ marginBottom: "0.5rem" }}>
						Received <strong>{comments.length}</strong> comments from MongoDB.
					</p>
					<ul style={{ marginTop: "1rem" }}>
						{comments.slice(0, 5).map((c) => (
							<li key={c._id} style={{ marginBottom: "0.35rem" }}>
								<strong>{c.name}</strong>:{" "}
								<span style={{ opacity: 0.8 }}>{c.text}</span>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}

export default App;
