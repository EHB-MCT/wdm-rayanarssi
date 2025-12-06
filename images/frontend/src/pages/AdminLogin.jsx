import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Input,
  Button,
  Stack,
  Text,
  Alert,
} from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin login mislukt");
      }

      localStorage.setItem("adminToken", data.token);
      setMessage("Succesvol ingelogd als admin");

      setTimeout(() => {
        navigate("/admin");
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.message || "Er ging iets mis");
    }
  };

  return (
    <Box maxW="420px" mx="auto">
      <Heading mb={6} size="lg">
        Admin Login
      </Heading>

      {error && (
        <Alert status="error" mb={4}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert status="success" mb={4}>
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Text mb={1}>Admin e-mail</Text>
            <Input
              type="email"
              placeholder="admin@streetlab.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.800"
            />
          </Box>

          <Box>
            <Text mb={1}>Wachtwoord</Text>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.800"
            />
          </Box>

          <Button type="submit" colorScheme="teal">
            Log in
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/home")}
          >
            Terug naar shop
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default AdminLogin;
