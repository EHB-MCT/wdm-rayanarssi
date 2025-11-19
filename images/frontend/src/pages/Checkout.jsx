import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Checkout() {
  const token = localStorage.getItem("token");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart/get`, {
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
    // geen echte payment — gewoon fake confirm
    setConfirmed(true);

    // OPTIONAL: clear cart (indien je dat wil)
    await fetch(`${API_URL}/cart/clear`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", token },
    });
  };

  if (!token) return null;

  if (confirmed) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        textAlign: "center",
        padding: "2rem",
      }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
          🎉 Bestelling bevestigd!
        </h1>
        <p style={{ fontSize: "1rem", color: "#9ca3af", maxWidth: "300px" }}>
          Bedankt voor je bestelling! 
        </p>
        <button
          onClick={() => (window.location.href = "/home")}
          style={{
            marginTop: "1.5rem",
            background: "#0ea5e9",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "none",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}>
          Terug naar Home
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "white",
      padding: "2rem",
      fontFamily: "system-ui",
    }}>
      <button
        onClick={() => (window.location.href = "/profile")}
        style={{
          background: "#0ea5e9",
          padding: "8px 14px",
          borderRadius: "999px",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: "1.5rem",
        }}>
        ← Terug
      </button>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Checkout
      </h1>

      {loading && <p>Je mandje wordt geladen…</p>}

      <div style={{ marginBottom: "1.5rem" }}>
        {cart.map((item) => (
          <div key={item._id} style={{
            marginBottom: "1rem",
            background: "#0f172a",
            padding: "1rem",
            borderRadius: "10px",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}>
            <img
              src={item.product.image}
              alt={item.product.name}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1rem" }}>
                {item.product.name}
              </h3>
              <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>
                Aantal: {item.quantity || 1}
              </p>
            </div>
            <strong>
              € {(item.product.price * (item.quantity || 1)).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>

      {/* TOTAALPRIJS */}

      <h2 style={{ marginTop: "1rem", fontSize: "1.3rem" }}>
        Totaal: <span style={{ color: "#34d399" }}>€ {totalPrice.toFixed(2)}</span>
      </h2>

      <button
        onClick={handleConfirm}
        style={{
          marginTop: "2rem",
          width: "100%",
          padding: "12px",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
          color: "#020617",
          fontWeight: 700,
          fontSize: "1rem",
        }}>
        Bestelling bevestigen
      </button>
    </div>
  );
}

export default Checkout;
