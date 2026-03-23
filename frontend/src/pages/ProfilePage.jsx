import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { Card } from "../components/ui/Card";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      const { data } = await api.get(`/social/profile/${user._id}`);
      setProfile(data);
    };
    load();
  }, [user?._id]);

  if (!profile) return <div className="center-message">Loading profile...</div>;

  return (
    <div className="space-y-4 py-6">
      <Card className="p-6">
        <h2 className="text-3xl font-black">{profile.user.name}</h2>
        <p className="text-brand-muted">{profile.user.department || "Unknown area"}</p>
        <div className="flex gap-4 mt-4">
          <span className="badge badge-yellow">Posts: {profile.totals.total}</span>
          <span className="badge badge-green">Resolved: {profile.totals.resolved}</span>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {profile.posts.map((p) => (
          <Card key={p._id} className="p-3">
            <p className="font-bold text-sm truncate">{p.title}</p>
            <p className="text-xs text-brand-muted">{p.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
