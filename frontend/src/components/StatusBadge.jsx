const StatusBadge = ({ status }) => {
  const className =
    status === "Resolved"
      ? "badge badge-green"
      : status === "In Progress"
        ? "badge badge-yellow"
        : "badge badge-red";

  return <span className={className}>{status}</span>;
};

export default StatusBadge;
