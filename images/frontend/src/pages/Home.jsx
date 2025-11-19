import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Home() {
	const token = localStorage.getItem("token");

	const [user, setUser] = useState(null);
	const [profileError, setProfileError] = useState("");

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [toast, setToast] = useState(null);

	const [searchParams, setSearchParams] = useSearchParams();

	const [category, setCategory] = useState(
		searchParams.get("category") || "all"
	);
	const [brand, setBrand] = useState(searchParams.get("brand") || "all");
	const [sort, setSort] = useState(searchParams.get("sort") || "price_asc");

	const brands = [
		"all",
		"AirDrop",
		"AirFlex",
		"BaseLayer",
		"Bloc Studio",
		"Courtline",
		"FadeLab",
		"Flight Air",
		"Grey",
		"HardWear",
		"Jordan",
		"JumpRise",
		"Nightshift",
		"NXT Division",
		"Railway",
		"Skyline",
		"Softlane",
		"Sphere",
		"Studio 13",
		"Subway Kids",
		"Trackside",
		"UrbanLayer",
		"Wave District",
		"YardLab",
	];

	// PROFIEL OPHALEN
	useEffect(() => {
		if (!token) {
			window.location.href = "/login";
			return;
		}
		fetchProfile();
	}, []);

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

	//  PRODUCTEN OPHALEN MET FILTERS
	useEffect(() => {
		fetchProducts();
	}, [category, brand, sort]);

	const fetchProducts = async () => {
		setLoading(true);
		setError("");

		try {
			const p = new URLSearchParams();
			if (category !== "all") p.set("category", category);
			if (brand !== "all") p.set("brand", brand);
			if (sort) p.set("sort", sort);

			setSearchParams(p);

			const url =
				p.toString().length > 0
					? `${API_URL}/products?${p.toString()}`
					: `${API_URL}/products`;
			const res = await fetch(url);
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Kon producten niet ophalen");
				setProducts([]);
				return;
			}

			setProducts(data.products || []);
		} catch (err) {
			console.error(err);
			setError("Er ging iets mis bij het ophalen van producten");
		} finally {
			setLoading(false);
		}
	};

	// TOAST
	const showToast = (type, text) => {
		setToast({ type, text });

		setTimeout(() => {
			setToast(null);
		}, 3000); // verdwijnt na 3 sec
	};

	const handleAddToCart = async (product) => {
		try {
			const res = await fetch(`${API_URL}/cart/add`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token,
				},
				body: JSON.stringify({ productId: product._id }),
			});

			const data = await res.json();

			if (!res.ok) {
				showToast("error", data.error || "Kon product niet toevoegen");
				return;
			}

			showToast("success", "Product toegevoegd aan je mandje!");
		} catch (err) {
			showToast("error", "Er ging iets mis bij het toevoegen");
		}
	};

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
					StreetLab Store
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

			{/* FILTERS */}
			<section
				style={{
					marginBottom: "1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
				}}
			>
				{/* Category buttons */}
				<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
					{[
						{ id: "all", label: "Alles" },
						{ id: "shoes", label: "Shoes" },
						{ id: "pants", label: "Broeken" },
						{ id: "tops", label: "Tops" },
						{ id: "jackets", label: "Jassen" },
					].map((cat) => (
						<button
							key={cat.id}
							onClick={() => setCategory(cat.id)}
							style={{
								padding: "8px 14px",
								borderRadius: "999px",
								border: "1px solid #1f2937",
								background: category === cat.id ? "#e5e7eb" : "#0f172a",
								color: category === cat.id ? "#020617" : "#e5e7eb",
								fontSize: "0.85rem",
								cursor: "pointer",
								fontWeight: category === cat.id ? 700 : 400,
							}}
						>
							{cat.label}
						</button>
					))}
				</div>

				{/* Brands + Sorting */}
				<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
					<select
						value={brand}
						onChange={(e) => setBrand(e.target.value)}
						style={{
							padding: "8px 12px",
							borderRadius: "999px",
							background: "#0f172a",
							color: "#e5e7eb",
							border: "1px solid #1f2937",
						}}
					>
						{brands.map((b) => (
							<option key={b} value={b}>
								{b === "all" ? "Alle merken" : b}
							</option>
						))}
					</select>

					<select
						value={sort}
						onChange={(e) => setSort(e.target.value)}
						style={{
							padding: "8px 12px",
							borderRadius: "999px",
							background: "#0f172a",
							color: "#e5e7eb",
							border: "1px solid #1f2937",
						}}
					>
						<option value="price_asc">Prijs: laag → hoog</option>
						<option value="price_desc">Prijs: hoog → laag</option>
						<option value="newest">Nieuwste eerst</option>
					</select>
				</div>
			</section>

			{/* Kleine hint / error (optioneel) */}
			{profileError && (
				<p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{profileError}</p>
			)}

			{/* PRODUCTS SECTIE */}
			<h2 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>Products</h2>

			{error && (
				<div
					style={{
						background: "#7f1d1d",
						border: "1px solid #f87171",
						color: "#fee2e2",
						padding: "8px 10px",
						borderRadius: "8px",
						marginBottom: "10px",
						fontSize: "0.9rem",
					}}
				>
					{error}
				</div>
			)}

			{loading && (
				<p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
					Streetwear aan het laden…
				</p>
			)}

			{!loading && products.length === 0 && !error && (
				<p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
					Geen producten gevonden.
				</p>
			)}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
					gap: "1.5rem",
					marginTop: "0.5rem",
				}}
			>
				{products.map((product) => (
					<article
						key={product._id}
						style={{
							background: "#0f172a",
							borderRadius: "14px",
							border: "1px solid #1f2937",
							overflow: "hidden",
							display: "flex",
							flexDirection: "column",
							boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
						}}
					>
						{/* IMAGE */}
						<div
							style={{
								width: "100%",
								paddingTop: "65%",
								position: "relative",
								background: "#020617",
							}}
						>
							{product.image && (
								<img
									src={product.image}
									alt={product.name}
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
									color: "#e0e7ff",
								}}
							>
								{product.name}
							</h3>
							<p
								style={{
									margin: 0,
									fontSize: "0.8rem",
									color: "#9ca3af",
								}}
							>
								{product.brand} • {product.color}
							</p>
							<p
								style={{
									margin: "4px 0 0",
									fontSize: "0.9rem",
									fontWeight: 600,
									color: "#34d399",
								}}
							>
								€ {product.price.toFixed(2)}
							</p>

							<button
								type="button"
								onClick={() => handleAddToCart(product)}
								style={{
									marginTop: "8px",
									width: "100%",
									padding: "8px 10px",
									borderRadius: "999px",
									border: "none",
									cursor: "pointer",
									background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
									color: "#020617",
									fontWeight: 600,
									fontSize: "0.9rem",
								}}
							>
								Toevoegen aan mandje
							</button>
						</div>

						{/* FLOATING TOAST */}
						{toast && (
							<div
								style={{
									position: "fixed",
									top: "20px",
									right: "20px",
									zIndex: 9999,
									background: toast.type === "success" ? "#065f46" : "#7f1d1d",
									color: "white",
									padding: "16px 20px",
									borderRadius: "12px",
									fontSize: "1rem",
									fontWeight: 600,
									transition: "all 0.3s ease",
									animation: "fadeIn 0.3s",
								}}
							>
								{toast.text}
							</div>
						)}
					</article>
				))}
			</div>
		</div>
	);
}

export default Home;
