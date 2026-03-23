import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, ClipboardList, CheckCircle, Clock, AlertCircle, Heart, MessageSquare, Share2 } from "lucide-react";
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
  const [stories, setStories] = useState([]);
  const [feed, setFeed] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get("/complaints/my");
        setComplaints(data);
        const [storiesRes, feedRes] = await Promise.all([api.get("/social/stories"), api.get("/social/feed")]);
        setStories(storiesRes.data);
        setFeed(feedRes.data);
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
    inProgress: complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
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

  const onSupport = async (id) => {
    await api.post(`/social/complaints/${id}/upvote`);
    const { data } = await api.get("/social/feed");
    setFeed(data);
  };

  const onComment = async (id) => {
    const text = commentDrafts[id]?.trim();
    if (!text) return;
    await api.post(`/social/complaints/${id}/comments`, { text });
    setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
    const { data } = await api.get("/social/feed");
    setFeed(data);
  };

  const onShare = async (id) => {
    const link = `${window.location.origin}/complaints/${id}`;
    await navigator.clipboard.writeText(link);
    alert("Complaint link copied");
  };

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

      <Card className="p-4">
        <h3 className="font-black uppercase tracking-widest text-xs text-brand-muted mb-3">Stories Updates</h3>
        <div className="flex gap-3 overflow-x-auto">
          {stories.length ? (
            stories.map((story) => (
              <div key={story._id} className="min-w-44 p-3 rounded-xl bg-brand-border/20">
                <p className="text-xs font-black">{story.authorityName}</p>
                <p className="text-xs text-brand-muted">{story.text || "Progress update posted"}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-brand-muted">No active stories</p>
          )}
        </div>
      </Card>

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

      <section className="space-y-4">
        <h3 className="text-xl font-black tracking-tight">Community Feed</h3>
        {feed.map((post) => (
          <Card key={post._id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-bold">{post.createdBy?.name || "Citizen"}</p>
                <p className="text-xs text-brand-muted">
                  {post.area || "Unknown area"} • {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary">
                {post.status}
              </span>
            </div>
            <p className="font-semibold">{post.title}</p>
            <p className="text-sm text-brand-muted">{post.description}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onSupport(post._id)}>
                <Heart size={14} className="mr-1" /> Support ({post.upvotesCount || 0})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onShare(post._id)}>
                <Share2 size={14} className="mr-1" /> Share
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {(post.comments || []).slice(0, 3).map((comment) => (
                <div key={comment._id} className="text-xs bg-brand-border/20 rounded-lg px-2 py-1">
                  <strong>{comment.userName}:</strong> {comment.text}
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 rounded-lg border border-brand-border"
                  placeholder="Add public comment..."
                  value={commentDrafts[post._id] || ""}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                />
                <Button size="sm" onClick={() => onComment(post._id)}>
                  <MessageSquare size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default CitizenDashboard;
