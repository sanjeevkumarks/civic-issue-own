import { useEffect, useMemo, useState } from "react";
import api from "../api";
import ComplaintCard from "../components/ComplaintCard";

const defaultDepartmentForm = {
  name: "",
  area: "",
  issueTypesHandled: ""
};

const statusColors = {
  Pending: "status-pending",
  "In Progress": "status-progress",
  Resolved: "status-resolved"
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState(defaultDepartmentForm);
  const [assignDrafts, setAssignDrafts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const [statsRes, complaintsRes, usersRes, departmentsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/complaints"),
        api.get("/admin/users"),
        api.get("/admin/departments")
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setUsers(usersRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const departmentNames = useMemo(() => departments.map((d) => d.name), [departments]);
  const totalComplaints = complaints.length || 1;

  const statusChart = useMemo(() => {
    const counts = {
      Pending: 0,
      "In Progress": 0,
      Resolved: 0
    };

    complaints.forEach((complaint) => {
      if (counts[complaint.status] !== undefined) {
        counts[complaint.status] += 1;
      }
    });

    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      percentage: Math.round((value / totalComplaints) * 100)
    }));
  }, [complaints, totalComplaints]);

  const departmentChart = useMemo(() => {
    const map = {};
    complaints.forEach((complaint) => {
      const department = complaint.department || "Unassigned";
      map[department] = (map[department] || 0) + 1;
    });

    return Object.entries(map)
      .map(([label, value]) => ({
        label,
        value,
        percentage: Math.round((value / totalComplaints) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [complaints, totalComplaints]);

  const assignDepartment = async (complaintId) => {
    const department = assignDrafts[complaintId];
    if (!department) return;

    try {
      await api.put(`/admin/complaints/${complaintId}/assign`, { department });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign department");
    }
  };

  const updateUser = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, {
        name: user.name,
        role: user.role,
        department: user.department
      });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/departments", departmentForm);
      setDepartmentForm(defaultDepartmentForm);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create department");
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user and all complaints created by this user?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/admin/departments/${id}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department");
    }
  };

  if (loading) return <div className="center-message">Loading admin dashboard...</div>;

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <p className="subtitle">System-wide oversight, assignments, and user/department management.</p>
      {error ? <p className="error-text">{error}</p> : null}

      <section className="stats-grid">
        <div className="panel stat-card">
          <h3>Total Complaints</h3>
          <p>{stats.total}</p>
        </div>
        <div className="panel stat-card">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="panel stat-card">
          <h3>Resolved</h3>
          <p>{stats.resolved}</p>
        </div>
      </section>

      <section className="chart-grid">
        <div className="panel">
          <h3>Status Rate Chart</h3>
          <p className="meta">Pending vs In Progress vs Resolved</p>
          <div className="chart-list">
            {statusChart.map((item) => (
              <div key={item.label} className="chart-row">
                <div className="chart-label">
                  <span>{item.label}</span>
                  <strong>
                    {item.value} ({item.percentage}%)
                  </strong>
                </div>
                <div className="chart-track">
                  <div
                    className={`chart-fill ${statusColors[item.label]}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Department-wise Chart</h3>
          <p className="meta">Complaint distribution by department</p>
          <div className="chart-list">
            {departmentChart.length ? (
              departmentChart.map((item) => (
                <div key={item.label} className="chart-row">
                  <div className="chart-label">
                    <span>{item.label}</span>
                    <strong>
                      {item.value} ({item.percentage}%)
                    </strong>
                  </div>
                  <div className="chart-track">
                    <div className="chart-fill dept-fill" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="meta">No complaint data yet.</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3>All Complaints & Department Assignment</h3>
        <div className="cards-grid">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint}>
              <div className="assign-row">
                <select
                  value={assignDrafts[complaint._id] || complaint.department || ""}
                  onChange={(e) =>
                    setAssignDrafts((prev) => ({ ...prev, [complaint._id]: e.target.value }))
                  }
                >
                  <option value="">Select department</option>
                  {departmentNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button type="button" className="button" onClick={() => assignDepartment(complaint._id)}>
                  Assign
                </button>
              </div>
            </ComplaintCard>
          ))}
        </div>
      </section>

      <section>
        <h3>User Management</h3>
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <input
                      value={user.name}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((u) => (u._id === user._id ? { ...u, name: e.target.value } : u))
                        )
                      }
                    />
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((u) => (u._id === user._id ? { ...u, role: e.target.value } : u))
                        )
                      }
                    >
                      <option value="Citizen">Citizen</option>
                      <option value="Authority">Authority</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={user.department || ""}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u._id === user._id ? { ...u, department: e.target.value } : u
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="action-group">
                      <button type="button" className="button" onClick={() => updateUser(user)}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Department Management</h3>
        <form className="panel department-form" onSubmit={createDepartment}>
          <input
            placeholder="Department Name"
            value={departmentForm.name}
            onChange={(e) => setDepartmentForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            placeholder="Area"
            value={departmentForm.area}
            onChange={(e) => setDepartmentForm((prev) => ({ ...prev, area: e.target.value }))}
            required
          />
          <input
            placeholder="Issue Types (comma separated)"
            value={departmentForm.issueTypesHandled}
            onChange={(e) =>
              setDepartmentForm((prev) => ({ ...prev, issueTypesHandled: e.target.value }))
            }
          />
          <button type="submit" className="button">
            Add Department
          </button>
        </form>
        <div className="panel">
          {departments.map((department) => (
            <div key={department._id} className="department-row">
              <p>
                <strong>{department.name}</strong> | Area: {department.area} | Handles:{" "}
                {department.issueTypesHandled?.join(", ") || "N/A"}
              </p>
              <button
                type="button"
                className="button button-light"
                onClick={() => deleteDepartment(department._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
