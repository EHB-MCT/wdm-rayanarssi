const API_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error || "Login mislukt" };
  }

  localStorage.setItem("token", data.token);
  return data;
}

export async function register(username, email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error || "Registratie mislukt" };
  }

  return data;
}
