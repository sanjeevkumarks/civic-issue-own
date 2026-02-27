import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === "Citizen") navigate("/citizen");
    if (user.role === "Authority") navigate("/authority");
    if (user.role === "Admin") navigate("/admin");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      if (data.user.role === "Citizen") navigate("/citizen");
      if (data.user.role === "Authority") navigate("/authority");
      if (data.user.role === "Admin") navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="panel auth-panel" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="meta">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
