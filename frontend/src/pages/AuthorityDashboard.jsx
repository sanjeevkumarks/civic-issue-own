import { useEffect, useState } from "react";
import api from "../api";
import ComplaintCard from "../components/ComplaintCard";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatWidget } from "../components/ui/StatWidget";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ClipboardList, 
  Search, 
  Filter, 
  Save,
  ChevronRight,
  MapPin,
  ExternalLink
} from "lucide-react";
import { getSocket } from "../socket";

const statuses = ["", "Pending", "In Progress", "Resolved"];

const AuthorityDashboard = () => {
  const { isGov, isSaas, isMinimal } = useUI();
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [onDuty, setOnDuty] = useState(false);

  const fetchComplaints = async (status = "") => {
    setLoading(true);
    setError("");
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const { data } = await api.get(`/authority/complaints${query}`);
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load department complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (!onDuty) return;
    const socket = getSocket();
    const pushLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("agent:on-duty", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          onDuty: true
        });
      });
    };
    pushLocation();
    const timer = setInterval(pushLocation, 30000);
    return () => {
      clearInterval(timer);
      navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("agent:on-duty", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          onDuty: false
        });
      });
    };
  }, [onDuty]);

  const updateDraft = (id, updates) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || complaints.find(c => c._id === id)?.status || "In Progress",
        progress: prev[id]?.progress ?? complaints.find(c => c._id === id)?.progress ?? 10,
        comment: prev[id]?.comment || "",
        ...updates
      }
    }));
  };

  const submitUpdate = async (id) => {
    try {
      const payload = drafts[id] || {};
      await api.put(`/authority/complaints/${id}`, payload);
      setExpandedId(null);
      await fetchComplaints(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold text-brand-muted uppercase tracking-widest">Loading Department Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={cn("text-4xl font-black tracking-tighter", isGov && "uppercase text-brand-primary")}>
            Authority <span className="text-brand-primary">Portal</span>
          </h2>
          <p className="text-brand-muted font-semibold italic">Official Department Oversight & Response System</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={onDuty ? "danger" : "primary"} size="sm" onClick={() => setOnDuty((v) => !v)}>
            {onDuty ? "Go Off Duty" : "Go On Duty"}
          </Button>
          <div className="px-4 py-2 bg-brand-primary/10 rounded-full border border-brand-primary/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-brand-primary uppercase tracking-widest">Connected to Gateway</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget label="Assigned" value={stats.total} icon={ClipboardList} color="primary" />
        <StatWidget label="Needs Action" value={stats.pending} icon={AlertCircle} color="danger" />
        <StatWidget label="Working" value={stats.inProgress} icon={Clock} color="warning" />
        <StatWidget label="Completed" value={stats.resolved} icon={CheckCircle} color="success" />
      </div>

      {/* Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or location..." 
            className="w-full pl-10 pr-4 py-2 bg-brand-border/20 rounded-xl border-none focus:ring-2 ring-brand-primary/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-brand-muted ml-2" />
          <Select 
            className="min-w-[150px] py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status || "all"} value={status}>
                {status || "All Statuses"}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 font-bold uppercase text-xs">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Grid or Table based on Mode */}
      {isGov ? (
        <Card className="overflow-hidden border-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b-2 border-brand-border">
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-primary">Status</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-primary">Complaint Details</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-primary">Location</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-primary">Progress</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-brand-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-brand-border">
                {filteredComplaints.map((complaint) => {
                  const isExpanded = expandedId === complaint._id;
                  const draft = drafts[complaint._id] || {
                    status: complaint.status,
                    progress: complaint.progress,
                    comment: ""
                  };

                  return (
                    <>
                      <tr key={complaint._id} className={cn(
                        "hover:bg-brand-border/10 transition-colors",
                        isExpanded && "bg-brand-primary/5"
                      )}>
                        <td className="p-4">
                          <div className={cn(
                            "inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                            complaint.status === "Pending" ? "bg-rose-500 text-white" :
                            complaint.status === "In Progress" ? "bg-amber-500 text-white" :
                            "bg-emerald-500 text-white"
                          )}>
                            {complaint.status}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="font-bold text-sm truncate">{complaint.title}</p>
                          <p className="text-xs text-brand-muted truncate">{complaint.category}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-xs font-semibold text-brand-muted">
                            <MapPin size={12} className="text-brand-primary" />
                            <span className="truncate max-w-[150px]">{complaint.address}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-24 h-2 bg-brand-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-primary"
                              style={{ width: `${complaint.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{complaint.progress}%</span>
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs font-black"
                            onClick={() => setExpandedId(isExpanded ? null : complaint._id)}
                          >
                            {isExpanded ? "CLOSE" : "MANAGE"}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-brand-primary/5">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <Select 
                                  label="Update Status"
                                  value={draft.status}
                                  onChange={(e) => updateDraft(complaint._id, { status: e.target.value })}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </Select>
                                <Input 
                                  type="number"
                                  label="Set Progress (%)"
                                  min={0}
                                  max={100}
                                  value={draft.progress}
                                  onChange={(e) => updateDraft(complaint._id, { progress: Number(e.target.value) })}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                <Textarea 
                                  label="Official Internal Comment"
                                  rows={4}
                                  placeholder="Describe the action taken or reason for status change..."
                                  value={draft.comment}
                                  onChange={(e) => updateDraft(complaint._id, { comment: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => setExpandedId(null)}>Cancel</Button>
                                  <Button variant="primary" size="sm" onClick={() => submitUpdate(complaint._id)}>
                                    <Save size={16} className="mr-2" /> Save & Broadcast
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => {
            const draft = drafts[complaint._id] || {
              status: complaint.status,
              progress: complaint.progress,
              comment: ""
            };

            return (
              <ComplaintCard key={complaint._id} complaint={complaint}>
                <div className="w-full space-y-4 pt-4 border-t border-brand-border">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      className="text-xs"
                      value={draft.status}
                      onChange={(e) => updateDraft(complaint._id, { status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </Select>
                    <Input
                      className="text-xs"
                      type="number"
                      min={0}
                      max={100}
                      value={draft.progress}
                      onChange={(e) => updateDraft(complaint._id, { progress: Number(e.target.value) })}
                    />
                  </div>
                  <Textarea
                    placeholder="Update notes..."
                    className="text-xs"
                    rows={2}
                    value={draft.comment}
                    onChange={(e) => updateDraft(complaint._id, { comment: e.target.value })}
                  />
                  <Button className="w-full text-xs font-bold" onClick={() => submitUpdate(complaint._id)}>
                    Update Status
                  </Button>
                </div>
              </ComplaintCard>
            );
          })}
        </div>
      )}

      {filteredComplaints.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <ClipboardList size={48} className="text-brand-muted mx-auto mb-4 opacity-20" />
          <p className="font-bold text-brand-muted">No complaints found assigned to your department.</p>
        </Card>
      )}
    </div>
  );
};

export default AuthorityDashboard;
