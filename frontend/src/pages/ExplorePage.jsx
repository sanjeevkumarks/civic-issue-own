import { useEffect, useState } from "react";
import api from "../api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

const ExplorePage = () => {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const { data } = await api.get(`/social/explore?${params.toString()}`);
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4 py-6">
      <h2 className="text-3xl font-black">Explore Complaints</h2>
      <Card className="p-4 grid md:grid-cols-4 gap-2">
        <Input placeholder="Search by location or keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option>Road</option>
          <option>Garbage</option>
          <option>Streetlight</option>
          <option>Drainage</option>
          <option>Water</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </Select>
        <button className="button" onClick={load} type="button">
          Search
        </button>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <Card key={c._id} className="p-4">
            <h3 className="font-bold">{c.title}</h3>
            <p className="text-sm text-brand-muted">{c.area}</p>
            <p className="text-sm">{c.description}</p>
            <p className="text-xs mt-2">Support: {c.upvotesCount || 0}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
