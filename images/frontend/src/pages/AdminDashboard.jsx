import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, Alert } from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AdminDashboard() {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [data, setData] = useState(null);

	useEffect(() => {
		if (!token) {
			navigate("/login");
			return;
		}
		const fetchData = async () => {
			try {
				setLoading(true);
				setError("");
				console.log("Using token:", token); // Debugging line
				const res = await fetch(`${API_URL}/adminprofile`, {
					headers: {
						"Content-Type": "application/json",
						token,
					},
				});
				const data = await res.json();
				console.log("Fetched admin data:", data); // Debugging line
				setData(data);
			} catch (err) {
				setError(err.message || "Er ging iets mis");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};

	if (loading) {
		return (
			<Box className="page admin-page">
				<Text className="admin-loading-text">Admin data wordt geladen…</Text>
			</Box>
		);
	}
	if (error) {
		return (
			<Box className="page admin-page">
				<Alert status="error" className="msg msg--error">
					{error}
				</Alert>
			</Box>
		);
	}

	return (
		<Box className="page admin-page">
			<div style={{ display: "flex", justifyContent: "flex-end" }}>
				<button
					type="button"
					onClick={handleLogout}
					className="btn btn--chip btn--chip-red"
				>
					Uitloggen
				</button>
			</div>

			<Heading className="admin-title" mb={6}>
				Admin Dashboard
			</Heading>

			{/* OVERZICHT CARDS */}
			<div className="admin-stats-grid">
				<div className="admin-stat-card">
					<p className="admin-stat-label">Gebruikers</p>
					<p className="admin-stat-number">{data.totalUsers ?? "-"}</p>
					<p className="admin-stat-help">Totaal geregistreerd</p>
				</div>

				<div className="admin-stat-card">
					<p className="admin-stat-label">Orders</p>
					<p className="admin-stat-number">{data.totalOrders ?? "-"}</p>
					<p className="admin-stat-help">Alle tijd</p>
				</div>

				<div className="admin-stat-card">
					<p className="admin-stat-label">Omzet</p>
					<p className="admin-stat-number">€ {data.totalRevenue ?? "-"}</p>
					<p className="admin-stat-help">Alle tijd</p>
				</div>

				<div className="admin-stat-card">
					<p className="admin-stat-label"> Totaal Events</p>
					<p className="admin-stat-number">{data.totalEvents ?? "-"}</p>
					<p className="admin-stat-help">Clicks and views</p>
				</div>
			</div>

			{/* TOP PRODUCTS */}
			<Box className="admin-section">
				<Heading size="md" mb={3}>
					Meest bekeken producten
				</Heading>

				<div className="admin-table-wrapper">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Product</th>
								<th className="admin-th-num">Views</th>
								<th className="admin-th-num">Add to cart</th>
							</tr>
						</thead>
						<tbody>
							{data.topProducts?.map((p, index) => (
								<tr key={p.productId || p._id || `top-product-${index}`}>
									<td>{p.name}</td>
									<td className="admin-td-num">{p.views}</td>
									<td className="admin-td-num">{p.addToCart}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Box>

			{/* USERS */}
			<Box className="admin-section">
				<Heading size="md" mb={3}>
					Gebruikers & profielen
				</Heading>

				<div className="admin-table-wrapper">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Username</th>
								<th>E-mail</th>
								<th>Aantal Bestellingen</th>
								<th className="admin-th-num">Events</th>
								<th>Aantal Logins</th>
							</tr>
						</thead>
						<tbody>
							{data.users?.map((u, index) => (
								<tr key={u.id || u._id || u.email || `user-${index}`}>
									<td>{u.username}</td>
									<td>{u.email}</td>
									<td>{u.orderCount}</td>
									<td>{u.eventsCount}</td>
									<td>{u.loginCount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Box>
		</Box>
	);
}

export default AdminDashboard;
