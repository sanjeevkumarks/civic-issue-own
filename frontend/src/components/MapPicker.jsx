import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const Recenter = ({ position }) => {
  const map = useMap();
  if (position) {
    map.setView(position, map.getZoom(), { animate: true });
  }
  return null;
};

const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const MapPicker = ({ position, onPick }) => {
  const defaultPosition = [20.5937, 78.9629];

  return (
    <div className="map-wrap">
      <MapContainer
        center={position ? [position.lat, position.lng] : defaultPosition}
        zoom={position ? 15 : 5}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {position ? <Marker position={[position.lat, position.lng]} /> : null}
        {position ? <Recenter position={[position.lat, position.lng]} /> : null}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
