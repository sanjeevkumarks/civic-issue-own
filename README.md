# Digital Civic Response System

Full-stack local web app for civic complaint reporting and response management.

## Tech Stack
- Backend: Node.js + Express + Mongoose
- Frontend: React (Vite)
- Database: Local MongoDB (`mongodb://localhost:27017/civicDB`)
- Maps: Leaflet.js + OpenStreetMap tiles
- Reverse Geocoding: OpenStreetMap Nominatim API
- Uploads: Multer storing files in local `backend/uploads`
- Auth: JWT (stored in browser localStorage)

## Folder Structure
```text
Project/
  backend/
    config/
      db.js
    middleware/
      auth.js
      upload.js
    models/
      User.js
      Complaint.js
      Department.js
      Notification.js
    routes/
      authRoutes.js
      complaintRoutes.js
      authorityRoutes.js
      adminRoutes.js
      notificationRoutes.js
      departmentRoutes.js
    utils/
      departmentMapping.js
      notify.js
      seedData.js
    uploads/
      .gitkeep
    .env.example
    package.json
    server.js
  frontend/
    public/
    src/
      components/
      context/
      pages/
      api.js
      App.jsx
      main.jsx
      styles.css
    .env.example
    index.html
    package.json
    vite.config.js
  .gitignore
  README.md
```

## Core Features Implemented
1. Authentication
- Register/Login
- Roles: `Citizen`, `Authority`, `Admin`
- Password hashing with `bcryptjs`
- JWT-protected APIs and role-based route checks

2. Complaint Reporting (Citizen)
- Fields: title, description, category, location, address, images
- Embedded Leaflet map with click-to-pin
- Use current location with browser geolocation
- Reverse geocoding via Nominatim
- Complaint saved with default status `Pending`, progress `0`

3. Location UX
- Complaint cards show address
- Address opens `https://www.google.com/maps?q=<lat>,<lng>` in new tab

4. Image Uploads
- Multer stores files in `backend/uploads`
- Backend serves `uploads` as static route (`/uploads/...`)
- Images visible in complaint cards across roles

5. Authority Dashboard
- Shows complaints for authority's department
- Filter by status (`Pending`, `In Progress`, `Resolved`)
- Update status/progress and add comments
- Citizen gets notification on update

6. Admin Dashboard
- View all complaints
- Assign departments
- Stats: total, pending, resolved
- Manage users and departments

7. Notifications
- `Notification` collection with `userId`, `message`, `seen`, `createdAt`
- Authorities notified on complaint creation
- Citizens notified on complaint status/progress updates

8. Database Collections
- `Users`
- `Complaints`
- `Departments`
- `Notifications`

9. UI
- Blue/white civic theme
- Responsive layout
- Complaint cards + status badges
- Embedded map in report form
- Image preview before upload

## Local Setup
### Prerequisites
- Node.js 18+
- npm
- Local MongoDB service running

### 1) Start MongoDB locally
Ensure your MongoDB instance is running at:
`mongodb://localhost:27017/civicDB`

### 2) Configure backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3) Configure frontend
Open another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Default Department Seeding
On backend startup, if `Departments` is empty, the app auto-seeds:
- Roads Department
- Sanitation Department
- Electrical Department
- Drainage Department
- Water Department

## API Summary
- Auth: `/api/auth/*`
- Complaints: `/api/complaints/*`
- Authority actions: `/api/authority/*`
- Admin actions: `/api/admin/*`
- Notifications: `/api/notifications/*`
- Departments: `/api/departments/*`

## Notes
- This project uses only local development tools and local file storage.
- No cloud services, paid APIs, or external object storage are used.
