import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Citizen",
    department: "General Civic"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      if (data.user.role === "Citizen") navigate("/citizen");
      if (data.user.role === "Authority") navigate("/authority");
      if (data.user.role === "Admin") navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="panel auth-panel" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

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
          minLength={6}
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        >
          <option value="Citizen">Citizen</option>
          <option value="Authority">Authority</option>
          <option value="Admin">Admin</option>
        </select>

        <label htmlFor="department">Department (for Authority/Admin)</label>
        <input
          id="department"
          value={form.department}
          onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="meta">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
