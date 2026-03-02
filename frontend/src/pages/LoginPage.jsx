import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { isGov, isSaas } = useUI();
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
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8 space-y-8 relative overflow-hidden">
        {isSaas && (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        )}
        
        <div className="text-center relative z-10">
          <div className={cn(
            "mx-auto h-12 w-12 flex items-center justify-center rounded-xl mb-4",
            isSaas ? "bg-gradient-to-br from-brand-primary to-purple-500 text-white shadow-lg" : "bg-brand-primary text-white"
          )}>
            <ShieldCheck size={28} />
          </div>
          <h2 className={cn(
            "text-3xl font-black tracking-tighter",
            isGov && "uppercase text-brand-primary"
          )}>
            Welcome <span className="text-brand-primary">Back</span>
          </h2>
          <p className="mt-2 text-sm text-brand-muted font-semibold">
            Secure access to the Digital Civic Response System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] text-brand-muted" size={18} />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] text-brand-muted" size={18} />
              <Input
                label="Security Password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-black uppercase">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <Button 
            className="w-full py-4 text-lg font-black tracking-tighter group" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN TO PORTAL"}
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-sm font-semibold">
            <span className="text-brand-muted">New to the system?</span>{" "}
            <Link to="/register" className="text-brand-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;

