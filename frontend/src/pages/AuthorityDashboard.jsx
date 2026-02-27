import { useEffect, useState } from "react";
import api from "../api";
import ComplaintCard from "../components/ComplaintCard";

const statuses = ["", "Pending", "In Progress", "Resolved"];

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

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

  const updateDraft = (id, updates) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || "In Progress",
        progress: prev[id]?.progress ?? 10,
        comment: prev[id]?.comment || "",
        ...updates
      }
    }));
  };

  const submitUpdate = async (id) => {
    try {
      const payload = drafts[id] || {};
      await api.put(`/authority/complaints/${id}`, payload);
      await fetchComplaints(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    }
  };

  if (loading) return <div className="center-message">Loading authority dashboard...</div>;

  return (
    <div className="page">
      <h2>Authority Dashboard</h2>
      <p className="subtitle">Manage complaints assigned to your department.</p>

      <div className="toolbar panel">
        <label htmlFor="statusFilter">Filter by status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status || "all"} value={status}>
              {status || "All"}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="cards-grid">
        {complaints.length ? (
          complaints.map((complaint) => {
            const draft = drafts[complaint._id] || {
              status: complaint.status,
              progress: complaint.progress,
              comment: ""
            };

            return (
              <ComplaintCard key={complaint._id} complaint={complaint}>
                <div className="update-form">
                  <label>Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => updateDraft(complaint._id, { status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  <label>Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.progress}
                    onChange={(e) => updateDraft(complaint._id, { progress: Number(e.target.value) })}
                  />

                  <label>Comment</label>
                  <textarea
                    rows={3}
                    value={draft.comment}
                    onChange={(e) => updateDraft(complaint._id, { comment: e.target.value })}
                  />

                  <button type="button" className="button" onClick={() => submitUpdate(complaint._id)}>
                    Save Update
                  </button>
                </div>
              </ComplaintCard>
            );
          })
        ) : (
          <div className="panel">No complaints found for this filter.</div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
