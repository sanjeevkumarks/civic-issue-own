import { useEffect, useMemo, useState } from "react";
import api from "../api";
import ComplaintCard from "../components/ComplaintCard";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatWidget } from "../components/ui/StatWidget";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  PieChart, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Map
} from "lucide-react";

const defaultDepartmentForm = {
  name: "",
  area: "",
  issueTypesHandled: ""
};

const statusColors = {
  Pending: "bg-rose-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-emerald-500"
};

const AdminDashboard = () => {
  const { isGov, isSaas } = useUI();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState(defaultDepartmentForm);
  const [assignDrafts, setAssignDrafts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const [statsRes, complaintsRes, usersRes, departmentsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/complaints"),
        api.get("/admin/users"),
        api.get("/admin/departments")
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setUsers(usersRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const departmentNames = useMemo(() => departments.map((d) => d.name), [departments]);
  const totalComplaints = complaints.length || 1;

  const statusChart = useMemo(() => {
    const counts = { Pending: 0, "In Progress": 0, Resolved: 0 };
    complaints.forEach((complaint) => {
      if (counts[complaint.status] !== undefined) counts[complaint.status] += 1;
    });
    return Object.entries(counts).map(([label, value]) => ({
      label, value, percentage: Math.round((value / totalComplaints) * 100)
    }));
  }, [complaints, totalComplaints]);

  const departmentChart = useMemo(() => {
    const map = {};
    complaints.forEach((complaint) => {
      const department = complaint.department || "Unassigned";
      map[department] = (map[department] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({
      label, value, percentage: Math.round((value / totalComplaints) * 100)
    })).sort((a, b) => b.value - a.value);
  }, [complaints, totalComplaints]);

  const assignDepartment = async (complaintId) => {
    const department = assignDrafts[complaintId];
    if (!department) return;
    try {
      await api.put(`/admin/complaints/${complaintId}/assign`, { department });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign department");
    }
  };

  const updateUser = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { name: user.name, role: user.role, department: user.department });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/departments", departmentForm);
      setDepartmentForm(defaultDepartmentForm);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create department");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/admin/departments/${id}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <ShieldCheck size={48} className="text-brand-primary mb-4 animate-bounce" />
      <p className="font-bold text-brand-muted uppercase tracking-widest">Verifying Admin Access...</p>
    </div>
  );

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={cn("text-4xl font-black tracking-tighter", isGov && "uppercase text-brand-primary")}>
            Admin <span className="text-brand-primary">Command</span>
          </h2>
          <p className="text-brand-muted font-semibold">Global System Administration & Analytics</p>
        </div>
        <div className="flex items-center gap-1 bg-brand-border/20 p-1 rounded-xl">
          {["overview", "complaints", "users", "departments"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg",
                activeTab === tab ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-brand-muted hover:text-brand-text"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 font-bold uppercase text-xs">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget label="System Total" value={stats.total} icon={ClipboardList} color="primary" trend={12} />
            <StatWidget label="Active Pending" value={stats.pending} icon={AlertCircle} color="danger" trend={-5} />
            <StatWidget label="Total Resolved" value={stats.resolved} icon={ShieldCheck} color="success" trend={24} />
            <StatWidget label="Active Users" value={users.length} icon={Users} color="warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-brand-primary" /> Status Distribution
              </h3>
              <div className="space-y-6">
                {statusChart.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span>{item.label}</span>
                      <span>{item.value} ({item.percentage}%)</span>
                    </div>
                    <div className="h-3 bg-brand-border/30 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", statusColors[item.label])}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-brand-primary" /> Department Efficiency
              </h3>
              <div className="space-y-4">
                {departmentChart.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-24 text-[10px] font-black uppercase truncate">{item.label}</div>
                    <div className="flex-1 h-2 bg-brand-border/30 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary opacity-60" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <div className="text-[10px] font-bold w-12 text-right">{item.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "complaints" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint}>
                <div className="w-full pt-4 border-t border-brand-border mt-auto flex gap-2">
                  <Select
                    className="text-xs py-1"
                    value={assignDrafts[complaint._id] || complaint.department || ""}
                    onChange={(e) => setAssignDrafts((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                  >
                    <option value="">Select Dept</option>
                    {departmentNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Select>
                  <Button size="sm" className="text-[10px] font-black" onClick={() => assignDepartment(complaint._id)}>
                    ASSIGN
                  </Button>
                </div>
              </ComplaintCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <Card className="overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-brand-border">
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-muted">Identity</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-muted">System Role</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-muted">Department</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-brand-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-brand-border/5">
                    <td className="p-4">
                      <input
                        className="bg-transparent font-bold text-sm outline-none focus:text-brand-primary"
                        value={user.name}
                        onChange={(e) => setUsers(prev => prev.map(u => u._id === user._id ? { ...u, name: e.target.value } : u))}
                      />
                      <p className="text-[10px] text-brand-muted">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <select
                        className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none"
                        value={user.role}
                        onChange={(e) => setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: e.target.value } : u))}
                      >
                        <option value="Citizen">Citizen</option>
                        <option value="Authority">Authority</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        className="bg-transparent text-xs outline-none focus:text-brand-primary"
                        placeholder="N/A"
                        value={user.department || ""}
                        onChange={(e) => setUsers(prev => prev.map(u => u._id === user._id ? { ...u, department: e.target.value } : u))}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={() => updateUser(user)}><Save size={14} /></Button>
                        <Button variant="danger" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={() => deleteUser(user._id)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <Card className="p-6 h-fit">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="text-brand-primary" /> New Department</h3>
            <form onSubmit={createDepartment} className="space-y-4">
              <Input placeholder="Dept Name (e.g. Public Works)" value={departmentForm.name} onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))} required />
              <Input placeholder="Operational Area" value={departmentForm.area} onChange={(e) => setDepartmentForm(prev => ({ ...prev, area: e.target.value }))} required />
              <Input placeholder="Issue Types (Road, Water...)" value={departmentForm.issueTypesHandled} onChange={(e) => setDepartmentForm(prev => ({ ...prev, issueTypesHandled: e.target.value }))} />
              <Button className="w-full font-black uppercase tracking-widest py-3" type="submit">CREATE ENTITY</Button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {departments.map((dept) => (
              <Card key={dept._id} className="p-4 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">{dept.name}</h4>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest flex items-center gap-1"><Map size={10} /> {dept.area}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {dept.issueTypesHandled?.map(type => (
                      <span key={type} className="px-2 py-0.5 bg-brand-border/30 rounded text-[8px] font-bold uppercase">{type}</span>
                    ))}
                  </div>
                  <Button variant="danger" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDepartment(dept._id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

