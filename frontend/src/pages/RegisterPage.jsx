import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { UserPlus, ArrowRight, User, Mail, Lock, Building2, AlertCircle } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isGov, isSaas } = useUI();
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
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-xl w-full p-8 space-y-8 relative overflow-hidden">
        {isSaas && (
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        )}
        
        <div className="text-center relative z-10">
          <div className={cn(
            "mx-auto h-12 w-12 flex items-center justify-center rounded-xl mb-4",
            isSaas ? "bg-gradient-to-br from-brand-primary to-purple-500 text-white shadow-lg" : "bg-brand-primary text-white"
          )}>
            <UserPlus size={28} />
          </div>
          <h2 className={cn(
            "text-3xl font-black tracking-tighter",
            isGov && "uppercase text-brand-primary"
          )}>
            Create <span className="text-brand-primary">Account</span>
          </h2>
          <p className="mt-2 text-sm text-brand-muted font-semibold">
            Join the Digital Civic Response network today.
          </p>
        </div>

        <form className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="space-y-4 md:col-span-2">
            <div className="relative">
              <User className="absolute left-3 top-[38px] text-brand-muted" size={18} />
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                className="pl-10"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] text-brand-muted" size={18} />
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] text-brand-muted" size={18} />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label="Account Role"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="Citizen">Citizen</option>
              <option value="Authority">Authority</option>
              <option value="Admin">Admin</option>
            </Select>

            {form.role !== "Citizen" && (
              <div className="relative">
                <Building2 className="absolute left-3 top-[38px] text-brand-muted" size={18} />
                <Input
                  label="Department"
                  placeholder="e.g. Sanitation"
                  className="pl-10"
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6 pt-4">
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
              {loading ? "CREATING ACCOUNT..." : "REGISTER FOR SYSTEM"}
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-sm font-semibold">
              <span className="text-brand-muted">Already registered?</span>{" "}
              <Link to="/login" className="text-brand-primary hover:underline">
                Sign in to your portal
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;

