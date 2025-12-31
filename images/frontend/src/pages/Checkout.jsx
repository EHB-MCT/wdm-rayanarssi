import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Checkout() {
	const token = localStorage.getItem("token");
	const navigate = useNavigate();

	const [cart, setCart] = useState([]);
	const [loading, setLoading] = useState(true);
	const [confirmed, setConfirmed] = useState(false);

	useEffect(() => {
		if (!token) {
			navigate("/login");
			return;
		}
		fetchCart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchCart = async () => {
		try {
			const res = await fetch(`${API_URL}/cart`, {
				headers: { "Content-Type": "application/json", token },
			});

			const data = await res.json();
			setCart(data.cart || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const totalPrice = cart.reduce(
		(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
		0
	);

	const handleConfirm = async () => {
		console.log(cart);
		try {
			const res = await fetch(`${API_URL}/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json", token },
				body: JSON.stringify({
					items: cart,
					total: totalPrice,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				console.error(data.error || "Kon bestelling niet bevestigen");
				return;
			}
			setConfirmed(true); // alleen op success
		} catch (err) {
			console.error(err);
		}
	};

	if (!token) return null;

	if (confirmed) {
		return (
			<Box className="checkout-page checkout-page--center">
				<h1 className="checkout-title">🎉 Bestelling bevestigd!</h1>
				<p className="checkout-subtitle">Bedankt voor je bestelling!</p>
				<button
					type="button"
					className="btn btn--chip btn--chip-blue"
					onClick={() => navigate("/home")}
				>
					Terug naar Home
				</button>
			</Box>
		);
	}

	return (
		<Box className="checkout-page">
			<button
				type="button"
				className="btn btn--chip btn--chip-blue"
				onClick={() => navigate("/profile")}
			>
				← Terug
			</button>

			<h1 className="checkout-title">Checkout</h1>

			{loading && <p className="checkout-loading">Je mandje wordt geladen…</p>}

			<div className="checkout-list">
				{cart.map((item, index) => (
					<div key={item._id || item.cartItemId || `checkout-${index}`} className="checkout-item">
						<img
							src={item.product.image}
							alt={item.product.name}
							className="checkout-item-image"
						/>
						<div className="checkout-item-info">
							<h3 className="checkout-item-title">{item.product.name}</h3>
							<p className="checkout-item-qty">Aantal: {item.quantity || 1}</p>
						</div>
						<strong className="checkout-item-price">
							€{((item.product.price || 0) * (item.quantity || 1)).toFixed(2)}
						</strong>
					</div>
				))}
			</div>

			<h2 className="checkout-total">
				Totaal:{" "}
				<span className="checkout-total-amount">€ {totalPrice.toFixed(2)}</span>
			</h2>

			<button
				type="button"
				className="btn btn--primary"
				onClick={handleConfirm}
			>
				Bestelling bevestigen
			</button>
		</Box>
	);
}

export default Checkout;
