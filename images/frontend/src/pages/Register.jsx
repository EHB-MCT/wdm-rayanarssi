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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Register() {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const clearMessages = () => {
		setMessage("");
		setError("");
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		clearMessages();

		try {
			const res = await fetch(`${API_URL}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Registratie mislukt");
				return;
			}

			// Success message
			setMessage("Account succesvol aangemaakt!");

			// After 1 sec → redirect to login page
			setTimeout(() => {
				navigate("/login");
			}, 1000);
		} catch (err) {
			setError("Er ging iets mis bij het registreren");
			console.log(err);
		}
	};

	return (
		<Box className="page auth-page">
			<Box className="auth-card">
				<Heading className="auth-title">Maak je account aan!</Heading>

				{message && (
					<Alert className="msg msg--success">
						{" "}
						{message}
					</Alert>
				)}
				{error && (
					<Alert className="msg msg--error">
						{error}
					</Alert>
				)}

				<form onSubmit={handleRegister} className="auth-form">
					<VStack spacing={3} align="stretch">
						<label className="auth-label">
							Username
							<Input
								className="auth-input"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Username"
								required
							/>
						</label>

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
							Account aanmaken
						</Button>
					</VStack>
				</form>

				<Text className="auth-text">
					Al een account?{" "}
					<Link as={RouterLink} to="/login" className="auth-link">
						Log hier in
					</Link>
				</Text>
			</Box>
		</Box>
	);
}

export default Register;
