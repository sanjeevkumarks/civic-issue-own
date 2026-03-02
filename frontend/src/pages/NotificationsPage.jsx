import { useEffect, useState } from "react";
import api from "../api";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Bell, Check, Trash2, Clock, AlertCircle } from "lucide-react";

const NotificationsPage = () => {
  const { isGov, isSaas } = useUI();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markSeen = async (id) => {
    await api.put(`/notifications/${id}/seen`);
    load();
  };

  const markAllSeen = async () => {
    await api.put("/notifications/seen/all");
    load();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Bell size={48} className="text-brand-muted animate-pulse mb-4" />
      <p className="font-bold text-brand-muted uppercase tracking-widest">Fetching Notifications...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={cn("text-3xl font-black tracking-tighter", isGov && "uppercase text-brand-primary")}>
            Activity <span className="text-brand-primary">Notifications</span>
          </h2>
          <p className="text-brand-muted font-semibold tracking-tight">Stay updated with system responses and assignments.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllSeen} className="gap-2 text-xs font-black">
            <Check size={16} /> MARK ALL READ
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 font-bold uppercase text-xs">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <Card
              key={notification._id}
              className={cn(
                "p-5 flex gap-4 items-start transition-all",
                !notification.seen && (isSaas ? "border-l-4 border-l-brand-primary bg-brand-primary/5 shadow-md" : "border-2 border-brand-primary")
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                notification.seen ? "bg-brand-border/30 text-brand-muted" : "bg-brand-primary text-white"
              )}>
                <Bell size={18} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <p className={cn(
                    "font-bold leading-tight",
                    !notification.seen ? "text-brand-text" : "text-brand-muted"
                  )}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-muted uppercase whitespace-nowrap ml-4">
                    <Clock size={10} />
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                  
                  {!notification.seen && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-[10px] font-black uppercase"
                      onClick={() => markSeen(notification._id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-20 text-center border-dashed border-2">
            <Bell size={64} className="text-brand-muted/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-1">Clear Horizon</h3>
            <p className="text-brand-muted">You're all caught up. No new notifications found.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

