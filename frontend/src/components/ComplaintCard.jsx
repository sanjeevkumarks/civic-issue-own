import { MapPin, Image as ImageIcon, MessageSquare, ExternalLink, ChevronRight } from "lucide-react";
import { useUI } from "../context/UIContext";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../utils/ui";
import { Link } from "react-router-dom";

const uploadsBase = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const ComplaintCard = ({ complaint, children, onStatusUpdate }) => {
  const { mode } = useUI();
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return "success";
      case "in-progress": return "warning";
      case "pending": return "danger";
      default: return "neutral";
    }
  };

  return (
    <Card className="flex flex-col p-5 h-full animate-fade-in relative group/card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-2">
          <Link to={`/complaints/${complaint._id}`} className="block">
            <h3 className={cn(
              "text-lg font-bold leading-tight mb-1 hover:text-brand-primary transition-colors",
              mode === "gov" && "uppercase text-brand-primary"
            )}>
              {complaint.title}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-2 items-center text-xs font-bold text-brand-muted uppercase tracking-widest">
            <span>{complaint.category}</span>
            <span>•</span>
            <span className="opacity-70">{complaint.department || "Unassigned"}</span>
          </div>
        </div>
        <Badge status={getStatusColor(complaint.status)}>
          {complaint.status}
        </Badge>
      </div>

      <p className="text-brand-text/80 text-sm mb-4 line-clamp-3">
        {complaint.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black uppercase mb-1 opacity-70">
          <span>Resolution Progress</span>
          <span>{complaint.progress}%</span>
        </div>
        <div className="h-2 w-full bg-brand-border/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary transition-all duration-500 ease-out"
            style={{ width: `${complaint.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted mb-4">
        <MapPin size={12} className="text-brand-primary" />
        <a
          href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline flex items-center gap-1 truncate"
        >
          {complaint.address}
          <ExternalLink size={10} />
        </a>
      </div>

      {complaint.images?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {complaint.images.slice(0, 3).map((image, idx) => (
            <div 
              key={`${image}-${idx}`} 
              className="aspect-square rounded-lg overflow-hidden border border-brand-border bg-black/5"
            >
              <img 
                src={`${uploadsBase}${image}`} 
                alt="complaint" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
              />
            </div>
          ))}
        </div>
      )}

      {complaint.comments?.length > 0 && mode !== "minimal" && (
        <div className="mt-auto pt-4 border-t border-brand-border">
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted mb-2 uppercase tracking-widest">
            <MessageSquare size={12} />
            Latest Update
          </div>
          <div className="bg-brand-border/20 p-2 rounded-lg text-xs italic opacity-80">
            "{complaint.comments[complaint.comments.length - 1].text}"
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link to={`/complaints/${complaint._id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full text-[10px] font-black tracking-widest">
            VIEW RECORD <ChevronRight size={14} className="ml-1" />
          </Button>
        </Link>
        {children}
      </div>
    </Card>
  );
};

export default ComplaintCard;

