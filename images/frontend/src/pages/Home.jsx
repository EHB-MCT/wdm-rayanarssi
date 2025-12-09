import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Heading, Text, Button, Select } from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const categories = [
	{ id: "all", label: "Alles" },
	{ id: "shoes", label: "Shoes" },
	{ id: "pants", label: "Broeken" },
	{ id: "tops", label: "Tops" },
	{ id: "jackets", label: "Jassen" },
];

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

function Home() {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [toast, setToast] = useState(null);

	useEffect(() => {
		if (!token) {
			navigate("/login");
		}
	}, [token, navigate]);

	const [user, setUser] = useState(null);
	const [profileError, setProfileError] = useState("");

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [searchParams, setSearchParams] = useSearchParams();

	const [category, setCategory] = useState(
		searchParams.get("category") || "all"
	);
	const [brand, setBrand] = useState(searchParams.get("brand") || "all");
	const [sort, setSort] = useState(searchParams.get("sort") || "price_asc");

	useEffect(() => {
		if (!token) {
			navigate("/login");
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

	const showToast = (type, text) => {
		setToast({ type, text });
		setTimeout(() => setToast(null), 3000);
	};

	const handleEvent = (type) => {
		fetch(`${API_URL}/events`, {
			method: "POST",
			headers: { "Content-Type": "application/json", token },
			body: JSON.stringify({ type, timestamp: new Date() }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (!data || data.status !== 200) {
					console.error(
						"Kon event niet verzenden:",
						data.error || "Onbekende fout"
					);
				}
			})
			.catch((err) => {
				console.error("Kon event niet verzenden:", err);
			});
	};

	if (!token) return null;

	const initial =
		user && user.username ? user.username.trim().charAt(0).toUpperCase() : "U";

	return (
		<Box className="page home-page">
			<header className="home-header">
				<Heading className="home-title">StreetLab Store</Heading>

				<Box
					className="home-avatar"
					onClick={() => navigate("/profile")}
					title={
						user
							? `${user.username} – klik om naar je profiel te gaan`
							: "Naar profiel"
					}
				>
					{initial}
				</Box>
			</header>

			<section className="home-filters">
				<div className="home-category-buttons">
					{categories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							className={category === cat.id ? "chip chip--active" : "chip"}
							onClick={() => setCategory(cat.id)}
						>
							{cat.label}
						</button>
					))}
				</div>

				<div className="home-select-row">
					<Select
						value={brand}
						onChange={(e) => setBrand(e.target.value)}
						className="home-select"
					>
						{brands.map((b) => (
							<option key={b} value={b}>
								{b === "all" ? "Alle merken" : b}
							</option>
						))}
					</Select>

					<Select
						value={sort}
						onChange={(e) => setSort(e.target.value)}
						className="home-select"
					>
						<option value="price_asc">Prijs: laag → hoog</option>
						<option value="price_desc">Prijs: hoog → laag</option>
						<option value="newest">Nieuwste eerst</option>
					</Select>
				</div>
			</section>

			{profileError && <Text className="home-error-text">{profileError}</Text>}

			<h2 className="home-products-title">Products</h2>

			{error && <div className="msg msg--error">{error}</div>}

			{loading && (
				<p className="home-loading-text">Streetwear aan het laden…</p>
			)}

			{!loading && products.length === 0 && !error && (
				<p className="home-loading-text">Geen producten gevonden.</p>
			)}

			<div className="home-products-grid">
				{products.map((product) => (
					<article
						key={product._id}
						className="product-card"
						onClick={() => {
							navigate(`/product/${product._id}`);
							handleEvent("click");
						}}
					>
						<div className="product-card-imageWrapper">
							{product.image && (
								<img
									src={product.image}
									alt={product.name}
									className="product-card-image"
								/>
							)}
						</div>

						<div className="product-card-content">
							<h3 className="product-card-title">{product.name}</h3>
							<p className="product-card-meta">
								{product.brand} • {product.color}
							</p>
							<p className="product-card-price">€ {product.price.toFixed(2)}</p>
						</div>
					</article>
				))}
			</div>
			{toast && (
				<div
					className={
						toast.type === "success"
							? "toast toast--success"
							: "toast toast--error"
					}
				>
					{toast.text}
				</div>
			)}
		</Box>
	);
}

export default Home;
