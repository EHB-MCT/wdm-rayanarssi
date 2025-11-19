// src/pages/Profile.jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Profile() {
	const token = localStorage.getItem("token");
	const [user, setUser] = useState(null);
	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			window.location.href = "/login";
			return;
		}
		fetchProfile();
		fetchCart();
	}, []);

	const showMessage = (text) => {
		setMessage(text);
		setTimeout(() => setMessage(""), 2500);
	};

	const showError = (text) => {
		setError(text);
		setTimeout(() => setError(""), 2500);
	};

	const fetchProfile = async () => {
		try {
			const res = await fetch(`${API_URL}/profile`, {
				headers: { "Content-Type": "application/json", token },
			});
			const data = await res.json();
			if (!res.ok) {
				showError(data.error || "Kon profiel niet ophalen");
				return;
			}
			setUser(data.user);
		} catch (err) {
			console.error(err);
			showError("Er ging iets mis bij het ophalen van je profiel");
		}
	};

	const fetchCart = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/cart/get`, {
				headers: { "Content-Type": "application/json", token },
			});
			const data = await res.json();
			if (!res.ok) {
				showError(data.error || "Kon mandje niet ophalen");
				setCart([]);
				return;
			}
			setCart(data.cart || []);
		} catch (err) {
			console.error(err);
			showError("Er ging iets mis bij het ophalen van het mandje");
			setCart([]);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveItem = async (itemId) => {
		try {
			const res = await fetch(`${API_URL}/cart/remove/${itemId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json", token },
			});
			const data = await res.json();
			if (!res.ok) {
				showError(data.error || "Kon item niet verwijderen");
				return;
			}
			showMessage("Item verwijderd uit mandje");
			fetchCart();
		} catch (err) {
			console.error(err);
			showError("Er ging iets mis bij het verwijderen");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.href = "/login";
	};

	if (!token) return null;

	const totalPrice = cart.reduce(
		(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
		0
	);

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#020617",
				color: "#e5e7eb",
				fontFamily: "system-ui",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			{/* TOASTS */}
			{message && (
				<div
					style={{
						position: "fixed",
						top: "20px",
						right: "20px",
						zIndex: 9999,
						background: "#065f46",
						color: "white",
						padding: "14px 18px",
						borderRadius: "12px",
						boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
						fontSize: "0.95rem",
						fontWeight: 600,
					}}
				>
					{message}
				</div>
			)}
			{error && (
				<div
					style={{
						position: "fixed",
						top: "20px",
						right: "20px",
						zIndex: 9999,
						background: "#7f1d1d",
						color: "white",
						padding: "14px 18px",
						borderRadius: "12px",
						boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
						fontSize: "0.95rem",
						fontWeight: 600,
					}}
				>
					{error}
				</div>
			)}

			{/* HEADER */}
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "2rem",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
					<button
						onClick={() => (window.location.href = "/home")}
						style={{
							background: "#0ea5e9",
							padding: "8px 14px",
							borderRadius: "999px",
							border: "none",
							color: "white",
							fontWeight: 600,
							cursor: "pointer",
							fontSize: "0.85rem",
						}}
					>
						← Terug
					</button>
					<div>
						<h1 style={{ margin: 0, fontSize: "2rem" }}>Profiel van {user?.username}</h1>
						<p
							style={{
								margin: "4px 0 0",
								color: "#9ca3af",
								fontSize: "0.9rem",
							}}
						>
							Overzicht van je account en mandje.

						</p>
					</div>
				</div>

				<button
					onClick={handleLogout}
					style={{
						background: "#dc2626",
						padding: "10px 16px",
						borderRadius: "999px",
						border: "none",
						color: "white",
						fontWeight: 600,
						cursor: "pointer",
						fontSize: "0.9rem",
					}}
				>
					Uitloggen
				</button>
			</header>

			{/* MANDJE */}
			<section
				style={{
					background: "#020617",
					borderRadius: "16px",
					border: "1px solid #1f2937",
					padding: "1.5rem",
					minHeight: "200px",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "0.75rem",
					}}
				>
					<h2 style={{ margin: 0, fontSize: "1.1rem" }}>Mijn mandje</h2>
					<span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
						{loading
							? "Aan het laden..."
							: `${cart.length} item(s) in je mandje`}
					</span>
				</div>

				{!loading && cart.length === 0 && (
					<p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
						Je mandje is nog leeg. Voeg producten toe vanuit de webshop.
					</p>
				)}

				{loading && (
					<p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
						Mandje aan het ophalen…
					</p>
				)}

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
						gap: "1.2rem",
						marginTop: "0.75rem",
					}}
				>
					{cart.map((item) => (
						<article
							key={item._id}
							style={{
								background: "#0f172a",
								borderRadius: "12px",
								border: "1px solid #1f2937",
								overflow: "hidden",
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* IMG */}
							<div
								style={{
									width: "100%",
									paddingTop: "60%",
									position: "relative",
									background: "#020617",
								}}
							>
								{item.product?.image && (
									<img
										src={item.product.image}
										alt={item.product.name}
										style={{
											position: "absolute",
											inset: 0,
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								)}
							</div>

							{/* TEXT */}
							<div
								style={{
									padding: "10px 12px 12px",
									display: "flex",
									flexDirection: "column",
									gap: "4px",
								}}
							>
								<h3
									style={{
										margin: 0,
										fontSize: "0.95rem",
										fontWeight: 600,
									}}
								>
									{item.product?.name}
								</h3>
								<p
									style={{
										margin: 0,
										fontSize: "0.8rem",
										color: "#9ca3af",
									}}
								>
									{item.product?.brand} • {item.product?.color}
								</p>
								<p
									style={{
										margin: "4px 0 0",
										fontSize: "0.85rem",
										color: "#9ca3af",
									}}
								>
									Aantal: {item.quantity || 1}
								</p>
								<p
									style={{
										margin: "2px 0 0",
										fontSize: "0.9rem",
										fontWeight: 600,
									}}
								>
									€ {(item.product?.price || 0).toFixed(2)}
								</p>

								<button
									type="button"
									onClick={() => handleRemoveItem(item._id)}
									style={{
										marginTop: "8px",
										width: "100%",
										padding: "8px 10px",
										borderRadius: "999px",
										border: "none",
										cursor: "pointer",
										background: "#ef4444",
										color: "white",
										fontWeight: 600,
										fontSize: "0.85rem",
									}}
								>
									Verwijderen
								</button>
							</div>
						</article>
					))}
				</div>

				{cart.length > 0 && (
					<div
						style={{
							marginTop: "1.25rem",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<h3 style={{ margin: 0, fontSize: "1rem" }}>
							Totaal: € {totalPrice.toFixed(2)}
						</h3>
						<button
							type="button"
							style={{
								padding: "9px 14px",
								borderRadius: "999px",
								border: "none",
								cursor: "pointer",
								background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
								color: "#020617",
								fontWeight: 700,
								fontSize: "0.9rem",
							}}
						>
							Naar checkout
						</button>
					</div>
				)}
			</section>
		</div>
	);
}

export default Profile;
