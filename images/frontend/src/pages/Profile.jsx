import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import AdminDashboard from "./AdminDashboard";
import { USER } from "./../models/user";
const API_URL = "http://localhost:3000";

function Profile() {
	const token = localStorage.getItem("token");
	const navigate = useNavigate();

	const [user, setUser] = useState(null);
	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			navigate("/login");
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
			const res = await fetch(`${API_URL}/cart`, {
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
			const res = await fetch(`${API_URL}/cart/${itemId}`, {
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
		navigate("/login");
	};

	if (!token) return null;

	const totalPrice = cart.reduce(
		(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
		0
	);

	return user && user.type === USER.CLIENT ? (
		<Box className="page profile-page">
			{message && <div className="toast toast--success">{message}</div>}
			{error && <div className="toast toast--error">{error}</div>}

			<header className="profile-header">
				<div className="profile-header-left">
					<button
						type="button"
						onClick={() => navigate("/home")}
						className="btn btn--chip btn--chip-blue"
					>
						← Terug
					</button>
					<div>
						<h1 className="profile-title">Profiel van {user?.username}</h1>
						<p className="profile-subtitle">
							Overzicht van je account en mandje.
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={handleLogout}
					className="btn btn--chip btn--chip-red"
				>
					Uitloggen
				</button>
			</header>

			<section className="cart-section">
				<div className="cart-header">
					<h2 className="cart-title">Mijn mandje</h2>
					<span className="cart-count">
						{loading
							? "Aan het laden..."
							: `${cart.length} item(s) in je mandje`}
					</span>
				</div>

				{!loading && cart.length === 0 && (
					<p className="cart-hint">
						Je mandje is nog leeg. Voeg producten toe vanuit de webshop.
					</p>
				)}

				{loading && <p className="cart-hint">Mandje aan het ophalen…</p>}

				<div className="cart-grid">
					{cart.map((item) => (
						<article key={item._id} className="cart-card">
							<div className="cart-card-imageWrapper">
								{item.product?.image && (
									<img
										src={item.product.image}
										alt={item.product.name}
										className="cart-card-image"
									/>
								)}
							</div>

							<div className="cart-card-content">
								<h3 className="cart-card-title">{item.product?.name}</h3>
								<p className="cart-card-meta">
									{item.product?.brand} • {item.product?.color}
								</p>
								<p className="cart-card-qty">Aantal: {item.quantity || 1}</p>
								<p className="cart-card-qty">Size: {item.size || "N/A"}</p>
								<p className="cart-card-price">
									€ {(item.product?.price || 0).toFixed(2)}
								</p>

								<button
									type="button"
									onClick={() => handleRemoveItem(item.cartItemId)}
									className="btn btn--danger"
								>
									Verwijderen
								</button>
							</div>
						</article>
					))}
				</div>

				{cart.length > 0 && (
					<div className="cart-footer">
						<h3 className="cart-total">Totaal: € {totalPrice.toFixed(2)}</h3>
						<button
							type="button"
							onClick={() => navigate("/checkout")}
							className="btn btn--primary btn--chip-wide"
						>
							Naar checkout
						</button>
					</div>
				)}
			</section>
		</Box>
	) : (
		<AdminDashboard />
	);
}

export default Profile;
