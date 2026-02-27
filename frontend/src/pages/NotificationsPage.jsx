import { useEffect, useState } from "react";
import api from "../api";

const NotificationsPage = () => {
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

  if (loading) return <div className="center-message">Loading notifications...</div>;

  return (
    <div className="page">
      <h2>Notifications</h2>
      <button type="button" className="button button-light" onClick={markAllSeen}>
        Mark All Seen
      </button>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="cards-grid">
        {notifications.length ? (
          notifications.map((notification) => (
            <article
              className={`panel notification-item ${notification.seen ? "is-seen" : ""}`}
              key={notification._id}
            >
              <p>{notification.message}</p>
              <p className="meta">{new Date(notification.createdAt).toLocaleString()}</p>
              {!notification.seen ? (
                <button type="button" className="button" onClick={() => markSeen(notification._id)}>
                  Mark Seen
                </button>
              ) : (
                <span className="meta">Seen</span>
              )}
            </article>
          ))
        ) : (
          <div className="panel">No notifications available.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
