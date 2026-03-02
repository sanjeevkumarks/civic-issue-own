import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/ui";
import { MapPin, Image as ImageIcon, ArrowLeft, Upload, AlertCircle } from "lucide-react";
import api from "../api";

const categories = ["Road", "Garbage", "Streetlight", "Drainage", "Water"];

const reverseGeocode = async (lat, lng) => {
  const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const response = await fetch(endpoint, {
    headers: {
      "Accept-Language": "en"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch address");
  }

  const payload = await response.json();
  return payload.display_name || "Address unavailable";
};

const ReportComplaintPage = () => {
  const navigate = useNavigate();
  const { isSaas, isGov, isMinimal } = useUI();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Road"
  });
  const [location, setLocation] = useState({ lat: null, lng: null, address: "" });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const markerPosition = useMemo(() => {
    if (location.lat === null || location.lng === null) return null;
    return { lat: location.lat, lng: location.lng };
  }, [location.lat, location.lng]);

  const onMapPick = async ({ lat, lng }) => {
    setError("");
    try {
      const address = await reverseGeocode(lat, lng);
      setLocation({ lat, lng, address });
    } catch (err) {
      setLocation({ lat, lng, address: "Address unavailable" });
      setError("Picked location, but reverse geocoding failed.");
    }
  };

  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const address = await reverseGeocode(lat, lng);
          setLocation({ lat, lng, address });
        } catch (err) {
          setLocation({ lat, lng, address: "Address unavailable" });
        }
      },
      () => {
        setError("Unable to fetch your current location.");
      }
    );
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (location.lat === null || location.lng === null) {
      setError("Please select a location from the map or use current location.");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("latitude", String(location.lat));
    payload.append("longitude", String(location.lng));
    payload.append("address", location.address || "Address unavailable");

    images.forEach((image) => payload.append("images", image));

    try {
      await api.post("/complaints", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      navigate("/citizen");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className={cn(
            "text-3xl font-black tracking-tighter",
            isGov && "uppercase text-brand-primary",
            isMinimal && "text-2xl"
          )}>
            Report <span className="text-brand-primary">Issue</span>
          </h2>
          <p className="text-brand-muted font-semibold">Provide details and location for the civic issue.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2 border-b border-brand-border pb-4 mb-4">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs">1</span>
              General Details
            </h3>
            
            <Input
              label="Issue Title"
              placeholder="e.g. Large Pothole on Main St"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>

            <Textarea
              label="Description"
              placeholder="Provide as much detail as possible..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold flex items-center gap-2 border-b border-brand-border pb-4 mb-4">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs">2</span>
              Visual Evidence
            </h3>
            
            <div className="relative group">
              <input 
                id="images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-brand-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-brand-primary transition-colors bg-brand-border/5">
                <Upload size={32} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
                <p className="font-bold text-sm">Drop images or click to upload</p>
                <p className="text-xs text-brand-muted uppercase font-bold tracking-widest">Supports multiple files</p>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-brand-border bg-black/5 relative group">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs">3</span>
                Location Selection
              </h3>
              <Button type="button" variant="secondary" size="sm" onClick={useCurrentLocation} className="text-xs">
                <MapPin size={14} className="mr-1" /> Use GPS
              </Button>
            </div>

            <div className="flex-1 min-h-[400px] mb-4 relative rounded-xl overflow-hidden border border-brand-border">
              <MapPicker position={markerPosition} onPick={onMapPick} />
            </div>

            <div className="bg-brand-border/20 p-4 rounded-xl flex gap-3">
              <MapPin className="text-brand-primary shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold uppercase text-brand-muted mb-1 tracking-widest">Selected Address</p>
                <p className="text-sm font-semibold leading-tight">{location.address || "Pick a point on the map..."}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500">
                <AlertCircle size={20} />
                <p className="text-xs font-bold uppercase">{error}</p>
              </div>
            )}

            <Button 
              className="w-full mt-6 py-4 text-lg font-black tracking-tighter shadow-brand-primary/30" 
              type="submit" 
              disabled={loading}
              variant="primary"
            >
              {loading ? "SUBMITTING REPORT..." : "SUBMIT COMPLAINT"}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ReportComplaintPage;

