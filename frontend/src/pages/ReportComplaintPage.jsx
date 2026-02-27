import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";
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
    <div className="page">
      <h2>Report Complaint</h2>
      <p className="subtitle">Pin exact issue location and submit evidence images.</p>

      <form className="panel" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          required
          rows={4}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="map-header">
          <label>Location Picker (click map to set marker)</label>
          <button type="button" className="button button-light" onClick={useCurrentLocation}>
            Use Current Location
          </button>
        </div>

        <MapPicker position={markerPosition} onPick={onMapPick} />

        <p className="meta">
          Address: {location.address || "Pick a location to auto-fetch address with Nominatim."}
        </p>

        <label htmlFor="images">Upload Images</label>
        <input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} />

        {images.length ? (
          <div className="image-preview-grid">
            {previewUrls.map((url, idx) => (
              <img key={`${images[idx].name}-${idx}`} src={url} alt={images[idx].name} />
            ))}
          </div>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
};

export default ReportComplaintPage;
