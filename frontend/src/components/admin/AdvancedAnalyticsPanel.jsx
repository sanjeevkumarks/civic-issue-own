import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet.markercluster";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api";
import { getSocket } from "../../socket";

const mapColors = {
  Pending: "#ef4444",
  "In Progress": "#f59e0b",
  Resolved: "#22c55e"
};

const drawHeat = (map, points) => {
  const layer = L.heatLayer(points.map((p) => [p.lat, p.lng, p.weight]), {
    radius: 30,
    blur: 22,
    maxZoom: 17,
    minOpacity: 0.45,
    gradient: {
      0.15: "#60a5fa",
      0.35: "#2563eb",
      0.55: "#14b8a6",
      0.72: "#f59e0b",
      0.88: "#f97316",
      1.0: "#dc2626"
    }
  });
  layer.addTo(map);
  return layer;
};

const drawCluster = (map, complaints) => {
  const clusterLayer = L.markerClusterGroup();
  complaints.forEach((c) => {
    const marker = L.marker([c.latitude, c.longitude]);
    marker.bindPopup(
      `<strong>${c.title}</strong><br/>Status: <span style="color:${mapColors[c.status] || "#334155"}">${c.status}</span>`
    );
    clusterLayer.addLayer(marker);
  });
  map.addLayer(clusterLayer);
  return clusterLayer;
};

const AdvancedAnalyticsPanel = ({ complaints }) => {
  const [heatmapData, setHeatmapData] = useState({ points: [], complaints: [] });
  const [areaDensity, setAreaDensity] = useState([]);
  const [trends, setTrends] = useState({ created: [], resolved: [], byCategory: [] });
  const [deptPerf, setDeptPerf] = useState([]);
  const [officerPerf, setOfficerPerf] = useState([]);
  const [agents, setAgents] = useState([]);
  const [mapMode, setMapMode] = useState("cluster");
  const [granularity, setGranularity] = useState("monthly");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [category, dateFrom, dateTo]);

  const reload = async () => {
    const qs = queryString ? `?${queryString}` : "";
    const [heat, area, trend, dept, officer] = await Promise.all([
      api.get(`/analytics/heatmap${qs}`),
      api.get(`/analytics/area-density${qs}`),
      api.get(`/analytics/trends${qs}${queryString ? "&" : "?"}granularity=${granularity}`),
      api.get("/analytics/department-performance"),
      api.get("/analytics/officer-performance")
    ]);
    setHeatmapData(heat.data);
    setAreaDensity(area.data);
    setTrends(trend.data);
    setDeptPerf(dept.data);
    setOfficerPerf(officer.data);
    const live = await api.get("/live/agents");
    setAgents(live.data);
  };

  useEffect(() => {
    reload();
  }, [queryString, granularity]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("complaints:new", reload);
    socket.on("complaints:updated", reload);
    socket.on("agent:location", (payload) => {
      setAgents((prev) => {
        const others = prev.filter((a) => String(a.userId) !== String(payload.userId));
        return [...others, payload];
      });
    });
    return () => {
      socket.off("complaints:new", reload);
      socket.off("complaints:updated", reload);
      socket.off("agent:location");
    };
  }, [queryString, granularity]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Digital Civic Response System - Complaint Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total complaints: ${complaints.length}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [["ID", "Title", "Category", "Status", "Area", "Department", "CreatedAt"]],
      body: complaints.map((c) => [
        String(c._id).slice(-8),
        c.title,
        c.category,
        c.status,
        c.area || "Unknown",
        c.department,
        new Date(c.createdAt).toLocaleDateString()
      ])
    });
    doc.save("complaints-report.pdf");
  };

  const exportCsv = async () => {
    const qs = queryString ? `?${queryString}` : "";
    const response = await api.get(`/export/complaints.csv${qs}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="panel">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              <option>Road</option>
              <option>Garbage</option>
              <option>Streetlight</option>
              <option>Drainage</option>
              <option>Water</option>
            </select>
          </div>
          <div>
            <label>From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label>To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label>Trend View</label>
            <select value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="button" type="button" onClick={reload}>
            Refresh
          </button>
          <button className="button button-light" type="button" onClick={exportCsv}>
            Export CSV
          </button>
          <button className="button button-light" type="button" onClick={exportPdf}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="flex gap-2 mb-2">
          <button className="button" onClick={() => setMapMode("cluster")} type="button">
            Cluster Map
          </button>
          <button className="button button-light" onClick={() => setMapMode("heat")} type="button">
            Heatmap
          </button>
        </div>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: 360 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapLayers mapMode={mapMode} data={heatmapData} />
        </MapContainer>
      </div>

      <div className="panel">
        <h3>Live On-duty Agents</h3>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: 260 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {agents.map((a) => (
            <LMarker key={String(a.userId)} agent={a} />
          ))}
        </MapContainer>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h3>Top Areas (Complaint Density)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={areaDensity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h3>Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={trends.byCategory} dataKey="value" nameKey="category" outerRadius={90}>
                {trends.byCategory.map((entry, idx) => (
                  <Cell key={entry.category} fill={["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"][idx % 5]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h3>Created vs Resolved Trend ({granularity})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={trends.created.map((c) => {
                const found = trends.resolved.find((r) => r.year === c.year && r.period === c.period);
                return {
                  label: `${c.year}-${String(c.period).padStart(2, "0")}`,
                  created: c.created,
                  resolved: found?.resolved || 0
                };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#2563eb" />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h3>Department Performance Leaderboard</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptPerf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolutionRate" fill="#22c55e" name="Resolution %" />
              <Bar dataKey="slaBreach" fill="#ef4444" name="SLA Breach" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel table-wrap">
        <h3>Officer-wise Resolution Report</h3>
        <table>
          <thead>
            <tr>
              <th>Officer</th>
              <th>Total Handled</th>
              <th>Resolved</th>
              <th>Avg Response Days</th>
              <th>SLA Compliance %</th>
            </tr>
          </thead>
          <tbody>
            {officerPerf.map((o, idx) => (
              <tr key={o.officerId}>
                <td>
                  {idx === 0 ? "🏆 " : idx === 1 ? "🥈 " : idx === 2 ? "🥉 " : ""}
                  {o.officerName}
                </td>
                <td>{o.totalHandled}</td>
                <td>{o.resolved}</td>
                <td>{o.avgResponseDays}</td>
                <td style={{ color: o.slaCompliancePct >= 80 ? "#16a34a" : o.slaCompliancePct >= 60 ? "#d97706" : "#dc2626" }}>
                  {o.slaCompliancePct}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const LMarker = ({ agent }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const marker = L.marker([agent.latitude, agent.longitude]).addTo(map);
    marker.bindPopup(
      `<strong>${agent.name}</strong><br/>${agent.department}<br/>${new Date(agent.timestamp).toLocaleString()}`
    );
    return () => map.removeLayer(marker);
  }, [map, agent]);
  return null;
};

const MapLayers = ({ mapMode, data }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    let layer;
    if (mapMode === "heat") {
      layer = drawHeat(map, data.points || []);
    } else {
      layer = drawCluster(map, data.complaints || []);
    }
    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [map, mapMode, data]);
  return null;
};

export default AdvancedAnalyticsPanel;
