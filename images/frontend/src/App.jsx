import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";

import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard";

// Protected route component
function ProtectedRoute({ children, adminOnly = false }) {
	const { isAuthenticated, isAdmin, loading } = useAuth();
	
	if (loading) {
		return <div>Loading...</div>;
	}
	
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}
	
	if (adminOnly && !isAdmin) {
		return <Navigate to="/home" replace />;
	}
	
	if (!adminOnly && isAdmin) {
		return <Navigate to="/admin" replace />;
	}
	
	return children;
}

function App() {
	return (
		<AuthProvider>
			<Layout>
				<Routes>
					{" "}
					<Route path="/" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/admin/login" element={<AdminLogin />} />
					
					{/* Client routes */}
					<Route 
						path="/home" 
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/product/:id" 
						element={
							<ProtectedRoute>
								<ProductDetail />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/profile" 
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						} 
					/>
					<Route 
						path="/checkout" 
						element={
							<ProtectedRoute>
								<Checkout />
							</ProtectedRoute>
						} 
					/>
					
					{/* Admin routes */}
					<Route 
						path="/admin" 
						element={
							<ProtectedRoute adminOnly>
								<AdminDashboard />
							</ProtectedRoute>
						} 
					/>
				</Routes>
			</Layout>
		</AuthProvider>
	);
}

export default App;
