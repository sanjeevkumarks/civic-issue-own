import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getSocket } from "../socket";
import { 
  Printer, 
  MapPin, 
  Clock, 
  User, 
  Building2, 
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Send
} from "lucide-react";

const uploadsBase = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isGov, mode } = useUI();
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const [complaintRes, chatRes] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get(`/chat/${id}`)
        ]);
        setComplaint(complaintRes.data);
        setMessages(chatRes.data);
      } catch (err) {
        setError("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("chat:join", id);
    const handler = (msg) => {
      if (String(msg.complaintId) === String(id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("chat:new-message", handler);
    return () => socket.off("chat:new-message", handler);
  }, [id]);

  const sendMessage = async () => {
    const text = chatDraft.trim();
    if (!text) return;
    setChatDraft("");
    await api.post(`/chat/${id}`, { message: text });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em]">Loading Record...</div>;
  if (error || !complaint) return <div className="p-20 text-center text-rose-500 font-bold uppercase">{error || "Record Not Found"}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 print:p-0 print:m-0 print:max-w-none">
      {/* Action Bar (hidden on print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ChevronLeft size={16} /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2">
            <Printer size={16} /> Print Case File
          </Button>
        </div>
      </div>

      {/* Official Header for Gov Mode Print */}
      <div className={cn(
        "hidden print:flex flex-col items-center border-b-4 border-slate-900 pb-8 mb-8 text-center",
        isGov && "flex"
      )}>
        <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-2xl mb-4">D</div>
        <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Digital Civic Response System</h1>
        <p className="text-sm font-bold opacity-70">OFFICIAL CASE RECORD: {complaint._id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge status={complaint.status?.toLowerCase().includes("progress") ? "warning" : complaint.status?.toLowerCase().includes("pending") ? "danger" : "success"}>
                  {complaint.status}
                </Badge>
                <h2 className="text-3xl font-black tracking-tighter mt-2">{complaint.title}</h2>
                <div className="flex items-center gap-2 text-brand-muted text-sm font-semibold mt-1">
                  <span>ID: {complaint._id}</span>
                  <span>•</span>
                  <span>{complaint.category}</span>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-2">Detailed Description</h4>
              <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.images?.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4">Evidence Attachments</h4>
                <div className="grid grid-cols-2 gap-4">
                  {complaint.images.map((img, idx) => (
                    <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-brand-border bg-black/5 print:border-slate-400">
                      <img src={`${uploadsBase}${img}`} alt="evidence" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Timeline / Comments */}
          <Card className="p-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-6 flex items-center gap-2">
              <Clock size={16} /> Resolution Timeline
            </h4>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
              {complaint.comments?.map((comment, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-brand-panel border-2 border-brand-primary flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  </div>
                  <div className="bg-brand-border/20 p-4 rounded-xl print:bg-slate-50 print:border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase tracking-tighter bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">
                        {comment.byRole} Update
                      </span>
                      <span className="text-[10px] text-brand-muted font-bold">
                        {new Date(comment.at || complaint.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm italic">"{comment.text}"</p>
                  </div>
                </div>
              ))}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-brand-panel border-2 border-emerald-500 flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 print:bg-slate-50 print:border">
                  <p className="text-xs font-black uppercase text-emerald-600 mb-1">Complaint Registered</p>
                  <p className="text-[10px] text-brand-muted font-bold">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Complaint Chat
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {messages.map((m) => (
                <div key={m._id || `${m.timestamp}-${m.senderId}`} className="p-3 rounded-xl bg-brand-border/20">
                  <p className="text-xs font-black uppercase tracking-wider text-brand-muted">{m.senderName}</p>
                  <p className="text-sm">{m.message}</p>
                  <p className="text-[10px] text-brand-muted">{new Date(m.timestamp || m.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-brand-border bg-brand-panel"
                placeholder="Type message..."
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button type="button" onClick={sendMessage}>
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4">Location Data</h4>
            <div className="space-y-4">
              <div className="aspect-square rounded-xl bg-slate-100 border border-brand-border overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                  <MapPin size={48} className="text-brand-primary animate-bounce" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-brand-panel/90 backdrop-blur-md p-3 rounded-lg border border-brand-border text-[10px] font-bold print:hidden">
                  GPS: {complaint.latitude}, {complaint.longitude}
                </div>
              </div>
              <div className="p-4 bg-brand-border/20 rounded-xl">
                <p className="text-[10px] font-black uppercase text-brand-muted mb-1 tracking-widest">Verified Address</p>
                <p className="text-sm font-bold leading-tight">{complaint.address}</p>
                <a 
                  href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-brand-primary text-xs font-bold hover:underline print:hidden"
                >
                  <ExternalLink size={14} /> Open in Google Maps
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4">Oversight</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-brand-muted">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-brand-muted">Assigned Department</p>
                  <p className="text-sm font-bold">{complaint.department || "PENDING ASSIGNMENT"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-brand-muted">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-brand-muted">Reported By</p>
                  <p className="text-sm font-bold">User {complaint.user?.name || "Anonymous"}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-border">
                <p className="text-[10px] font-black uppercase text-brand-muted mb-2">Resolution Status</p>
                <div className="h-4 w-full bg-brand-border/30 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-1000"
                    style={{ width: `${complaint.progress}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference">
                    {complaint.progress}% COMPLETE
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="hidden print:block text-[10px] font-bold text-slate-400 mt-20 italic">
            This is a computer-generated official document. Digital verification signature: CIV-{complaint._id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
