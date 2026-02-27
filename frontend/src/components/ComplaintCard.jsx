import StatusBadge from "./StatusBadge";

const uploadsBase = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const ComplaintCard = ({ complaint, children }) => {
  return (
    <article className="complaint-card">
      <div className="complaint-card-header">
        <div>
          <h3>{complaint.title}</h3>
          <p className="meta">
            {complaint.category} | Department: {complaint.department}
          </p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p>{complaint.description}</p>

      <p className="meta">Progress: {complaint.progress}%</p>

      <p className="meta">
        Location:{" "}
        <a
          href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="link"
        >
          {complaint.address}
        </a>
      </p>

      {complaint.images?.length ? (
        <div className="image-grid">
          {complaint.images.map((image, idx) => (
            <a key={`${image}-${idx}`} href={`${uploadsBase}${image}`} target="_blank" rel="noreferrer">
              <img src={`${uploadsBase}${image}`} alt={`${complaint.title}-${idx}`} />
            </a>
          ))}
        </div>
      ) : null}

      {complaint.comments?.length ? (
        <div className="comment-box">
          <strong>Updates</strong>
          {complaint.comments.map((comment, idx) => (
            <p key={`${comment.at}-${idx}`}>
              {comment.text} ({comment.byRole})
            </p>
          ))}
        </div>
      ) : null}

      {children}
    </article>
  );
};

export default ComplaintCard;
