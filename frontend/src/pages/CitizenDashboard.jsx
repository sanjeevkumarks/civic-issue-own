import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import ComplaintCard from "../components/ComplaintCard";
import { StatWidget } from "../components/ui/StatWidget";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import api from "../api";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";

const CitizenDashboard = () => {
  const { isGov, isMinimal } = useUI();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get("/complaints/my");
        setComplaints(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
    inProgress: complaints.filter(c => c.status?.toLowerCase() === "in-progress").length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || c.status?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
      <ClipboardList size={48} className="text-brand-muted mb-4" />
      <p className="font-bold text-brand-muted uppercase tracking-widest">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={cn("text-4xl font-black tracking-tighter", isGov && "uppercase text-brand-primary")}>
            Citizen <span className="text-brand-primary">Dashboard</span>
          </h2>
          <p className="text-brand-muted font-semibold">Track and manage your civic reports</p>
        </div>
        <Link to="/report">
          <Button className="gap-2 px-6">
            <Plus size={20} />
            New Complaint
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget label="Total Filed" value={stats.total} icon={ClipboardList} color="primary" />
        <StatWidget label="Pending" value={stats.pending} icon={AlertCircle} color="danger" />
        <StatWidget label="In Progress" value={stats.inProgress} icon={Clock} color="warning" />
        <StatWidget label="Resolved" value={stats.resolved} icon={CheckCircle} color="success" />
      </div>

      {/* Filters & Actions */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search complaints by title or category..." 
            className="w-full pl-10 pr-4 py-2 bg-brand-border/20 rounded-xl border-none focus:ring-2 ring-brand-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["all", "pending", "in-progress", "resolved"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-brand-primary text-white shadow-md" 
                  : "bg-brand-border/40 text-brand-muted hover:bg-brand-border/60"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </Card>

      {/* Complaints Grid */}
      {error ? (
        <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-2" />
          <p className="text-rose-500 font-bold uppercase">{error}</p>
        </Card>
      ) : filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      ) : (
        <Card className="p-20 text-center border-dashed border-2">
          <div className="max-w-xs mx-auto">
            <ClipboardList size={64} className="text-brand-muted/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No complaints found</h3>
            <p className="text-brand-muted mb-6">You haven't submitted any complaints matching these filters yet.</p>
            <Link to="/report">
              <Button variant="secondary">File your first report</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CitizenDashboard;
