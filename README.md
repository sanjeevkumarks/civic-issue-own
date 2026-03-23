# Digital Civic Response System (Advanced)

Full-stack civic platform with complaint management, geo analytics, social feed, chat, and real-time operations.

## Stack
- Frontend: React + Tailwind CSS + Leaflet + Recharts + jsPDF
- Backend: Node.js + Express + Socket.io
- Database: MongoDB local (`mongodb://localhost:27017/civicDB`)
- Maps: OpenStreetMap + Leaflet (heatmap + marker clusters)
- Push: Web Push API (VAPID)
- WhatsApp: Twilio (optional)

## New Advanced Features Implemented
1. Complaint heatmap + marker cluster map (admin analytics)
2. Area-density analysis and top-areas chart
3. Weekly/monthly trend charts and category pie chart
4. Department performance leaderboard + officer performance table
5. Authority live location (on-duty mode, 30s updates via Socket.io)
6. Geo-fence CRUD and in-zone detection on complaint creation
7. SLA tracking/escalation and SLA breach stats
8. CSV export (json2csv) and PDF export (jsPDF)
9. Real-time complaint chat room per complaint
10. Social feed: upvotes/support, comments, stories, explore, profile
11. PWA basics: manifest + service worker + push subscription endpoints
12. Optional WhatsApp status messages via Twilio

## Backend New Collections
- Messages
- AgentLocation
- GeoFences
- Upvotes
- PushSubscriptions
- FeedComments
- Stories

## Key API Groups
- `/api/analytics/*`
- `/api/chat/*`
- `/api/geofences/*`
- `/api/live/*`
- `/api/push/*`
- `/api/export/*`
- `/api/social/*`

## Local Setup
### 1) MongoDB
Ensure local MongoDB is running on:
`mongodb://localhost:27017/civicDB`

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open: `http://localhost:5173`

## Push Notifications (optional)
Set in `backend/.env`:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Generate keys:
```bash
npx web-push generate-vapid-keys
```

## WhatsApp (optional)
Set in `backend/.env`:
- `WHATSAPP_ENABLED=true`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

Users can store `phone` and `whatsappOptIn` in profile/admin updates.

## Real-time
- Socket auth uses JWT token from frontend local storage
- Rooms:
  - `complaint:<complaintId>` for chat
- Events:
  - `chat:new-message`
  - `complaints:new`
  - `complaints:updated`
  - `agent:location`

## Notes
- All features are implemented for local development.
- For production, add stronger validation, pagination, and background jobs for SLA processing.
