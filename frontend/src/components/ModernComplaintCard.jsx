import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Heart, MessageSquare, Share2, MapPin, TrendingUp } from "lucide-react";
import { cn } from "../utils/ui";

const statusColors = {
  pending: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "badge-pending" },
  "in progress": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "badge-progress" },
  resolved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "badge-resolved" },
  closed: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", badge: "badge-closed" },
};

const priorityConfig = {
  low: { color: "text-blue-600", bg: "bg-blue-100" },
  medium: { color: "text-yellow-600", bg: "bg-yellow-100" },
  high: { color: "text-orange-600", bg: "bg-orange-100" },
  urgent: { color: "text-red-600", bg: "bg-red-100" },
};

export const ModernComplaintCard = ({ complaint, onShare, onSupport, onComment }) => {
  const status = complaint.status?.toLowerCase() || "pending";
  const statusConfig = statusColors[status] || statusColors.pending;
  const priority = complaint.priority?.toLowerCase() || "medium";
  const priorityConfig_ = priorityConfig[priority] || priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      {/* Header Section */}
      <div className={cn("p-6 border-b", statusConfig.bg)}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition">
              {complaint.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {complaint.category}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border",
              statusConfig.badge
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {priority !== "medium" && (
              <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", priorityConfig_.bg, priorityConfig_.color)}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>
              {complaint.createdAt
                ? new Date(complaint.createdAt).toLocaleDateString()
                : "Recently"}
            </span>
          </div>
          {complaint.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="line-clamp-1">{complaint.location.address || `(${complaint.location.lat}, ${complaint.location.lng})`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="p-6">
        <p className="text-sm text-gray-700 line-clamp-3 mb-4">
          {complaint.description}
        </p>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={complaint.reportedBy?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${complaint.reportedBy?.name}`}
            alt={complaint.reportedBy?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{complaint.reportedBy?.name}</p>
            <p className="text-xs text-gray-600">{complaint.reportedBy?.role}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSupport?.(complaint._id)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
          >
            <Heart size={16} />
            <span>{complaint.upvotes || 0}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <MessageSquare size={16} />
            <span>{complaint.comments?.length || 0}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShare?.(complaint._id)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition"
          >
            <Share2 size={16} />
          </motion.button>
        </div>

        <Link to={`/complaints/${complaint._id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            View Details
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};
