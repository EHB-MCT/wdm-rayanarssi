import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";

import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
	return (
		<AuthProvider>
			<Layout>
				<Routes>
					{" "}
					<Route path="/" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/home" element={<Home />} />
					<Route path="/product/:id" element={<ProductDetail />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/admin/login" element={<AdminLogin />} />
					<Route path="/admin" element={<AdminDashboard />} />
				</Routes>
			</Layout>
		</AuthProvider>
	);
}

export default App;
