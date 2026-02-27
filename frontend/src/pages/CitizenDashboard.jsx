import { useEffect, useState } from "react";
import ComplaintCard from "../components/ComplaintCard";
import api from "../api";

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="center-message">Loading your complaints...</div>;

  return (
    <div className="page">
      <h2>Citizen Dashboard</h2>
      <p className="subtitle">Track your submitted complaints and status updates.</p>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="cards-grid">
        {complaints.length ? (
          complaints.map((complaint) => <ComplaintCard key={complaint._id} complaint={complaint} />)
        ) : (
          <div className="panel">No complaints submitted yet.</div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
