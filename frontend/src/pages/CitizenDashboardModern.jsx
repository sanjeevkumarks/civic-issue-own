import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ClipboardList, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import ModernComplaintCard from "../components/ModernComplaintCard";
import { DashboardStatCard } from "../components/DashboardStatCard";
import api from "../api";
import { cn } from "../utils/ui";

const CitizenDashboardModern = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    inProgress: complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
  };

  const filteredComplaints = complaints.filter(c => {
    return filter === "all" || c.status?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <ClipboardList size={48} className="text-blue-600" />
        </motion.div>
        <p className="text-lg font-semibold text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="heading-h1 text-gray-900 mb-2">
            Citizen Dashboard
          </h1>
          <p className="text-gray-600 font-medium">
            Track and manage your civic reports
          </p>
        </div>
        <Link to="/report">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Report New Issue
          </motion.button>
        </Link>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <DashboardStatCard
          icon={ClipboardList}
          label="Total Complaints"
          value={stats.total}
          color="blue"
        />
        <DashboardStatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          change={stats.pending > 2 ? -10 : 5}
          color="amber"
        />
        <DashboardStatCard
          icon={TrendingUp}
          label="In Progress"
          value={stats.inProgress}
          change={stats.inProgress > 1 ? 15 : -5}
          color="purple"
        />
        <DashboardStatCard
          icon={CheckCircle}
          label="Resolved"
          value={stats.resolved}
          change={20}
          color="green"
        />
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 flex-wrap"
      >
        {["all", "pending", "in progress", "resolved"].map(status => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-all",
              filter === status
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
        >
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">
            No complaints found for this filter
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {filter === "all" ? "Report your first issue to get started!" : "Try a different filter"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredComplaints.map((complaint, idx) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ModernComplaintCard
                complaint={complaint}
                onShare={() => {
                  const link = `${window.location.origin}/complaints/${complaint._id}`;
                  navigator.clipboard.writeText(link);
                  alert("Link copied!");
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CitizenDashboardModern;
