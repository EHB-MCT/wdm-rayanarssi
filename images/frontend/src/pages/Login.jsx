import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
	Box,
	Heading,
	Text,
	Input,
	Button,
	VStack,
	Alert,
	Link,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const clearMessages = () => {
		setMessage("");
		setError("");
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		clearMessages();

		try {
const res = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || data.message || "Login mislukt");
				return;
			}

			// Get user data after successful login
			if (data.token) {
				try {
					const profileRes = await fetch(`${API_URL}/profile`, {
						headers: { 
							"Content-Type": "application/json", 
							token: data.token 
						},
					});
					
					const profileData = await profileRes.json();
					const userData = profileData.user || { type: 1 };
					login(userData, data.token);
					setMessage(data.message || "Succesvol ingelogd");
					setTimeout(() => {
						// Redirect admin to dashboard, clients to home
						if (userData.type === 0) {
							navigate("/admin");
						} else {
							navigate("/home");
						}
					}, 700);
				} catch {
					// Fallback if profile fetch fails
					login({ type: 1 }, data.token);
					setMessage(data.message || "Succesvol ingelogd");
					setTimeout(() => navigate("/home"), 700);
				}
				const userData = data.user || { type: 1 };
				login(userData, data.token);
				setMessage(data.message || "Succesvol ingelogd");
				setTimeout(() => {
					// Redirect admin to dashboard, clients to home
					if (userData.type === 0) {
						navigate("/admin");
					} else {
						navigate("/home");
					}
				}, 700);
			}
		} catch (err) {
			console.error(err);
			setError("Er ging iets mis bij het inloggen");
		}
	};

	return (
		<Box className="page auth-page">
			<Heading className="auth-title">Authenticatie Systeem</Heading>

			<Box className="auth-card">
				{message && <Alert className="msg msg--success">{message}</Alert>}
				{error && <Alert className="msg msg--error">{error}</Alert>}

				<form onSubmit={handleLogin} className="auth-form">
					<VStack spacing={3} align="stretch">
						<label className="auth-label">
							Email
							<Input
								className="auth-input"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email"
								required
							/>
						</label>

						<label className="auth-label">
							Wachtwoord
							<Input
								className="auth-input"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Wachtwoord"
								required
							/>
						</label>

						<Button type="submit" className="btn btn--primary">
							Inloggen
						</Button>
					</VStack>
				</form>

				<Text className="auth-text auth-text--center">
					Nog geen account?{" "}
					<Link as={RouterLink} to="/" className="auth-link">
						Maak er hier één aan
					</Link>
				</Text>
			</Box>
		</Box>
	);
}

export default Login;
