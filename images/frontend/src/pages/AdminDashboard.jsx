import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, Input, Alert } from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { adminToken },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kon admin stats niet laden");
        }

        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Er ging iets mis");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminToken, navigate]);

  if (!adminToken) return null;

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

  const filteredUsers =
    stats?.users?.filter((u) =>
      userFilter
        ? (u.email || "").toLowerCase().includes(userFilter.toLowerCase()) ||
          (u.uid || "").toLowerCase().includes(userFilter.toLowerCase())
        : true
    ) || [];

  return (
    <Box className="page admin-page">
      <Heading className="admin-title" mb={6}>
        Admin Dashboard
      </Heading>

      {/* OVERZICHT CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Gebruikers</p>
          <p className="admin-stat-number">{stats.totalUsers ?? "-"}</p>
          <p className="admin-stat-help">Totaal geregistreerd</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Orders</p>
          <p className="admin-stat-number">{stats.totalOrders ?? "-"}</p>
          <p className="admin-stat-help">Alle tijd</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Omzet</p>
          <p className="admin-stat-number">
            €{stats.totalRevenue ? stats.totalRevenue.toFixed(2) : "-"}
          </p>
          <p className="admin-stat-help">Alle tijd</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Events vandaag</p>
          <p className="admin-stat-number">{stats.eventsToday ?? "-"}</p>
          <p className="admin-stat-help">Clicks, views, hovers…</p>
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
              {stats.topProducts?.map((p) => (
                <tr key={p.productId}>
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

        <Input
          placeholder="Filter op e-mail of UID"
          className="admin-filter-input"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>E-mail</th>
                <th className="admin-th-num">Events</th>
                <th>Laatst actief</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.uid}>
                  <td>{u.uid}</td>
                  <td>{u.email}</td>
                  <td className="admin-td-num">{u.eventsCount}</td>
                  <td>{u.lastActive}</td>
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
