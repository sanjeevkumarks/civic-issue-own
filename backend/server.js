const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const seedDefaultDepartments = require("./utils/seedData");
const AgentLocation = require("./models/AgentLocation");
const User = require("./models/User");
const { setIO } = require("./utils/socket");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const authorityRoutes = require("./routes/authorityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const geofenceRoutes = require("./routes/geofenceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const socialRoutes = require("./routes/socialRoutes");
const liveRoutes = require("./routes/liveRoutes");
const pushRoutes = require("./routes/pushRoutes");
const exportRoutes = require("./routes/exportRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Digital Civic Response System API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/geofences", geofenceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/export", exportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  await seedDefaultDepartments();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }
  });
  setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name role department");
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", (complaintId) => {
      socket.join(`complaint:${complaintId}`);
    });

    socket.on("agent:on-duty", async (payload) => {
      if (socket.user.role !== "Authority") return;
      const entry = await AgentLocation.create({
        userId: socket.user._id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        onDuty: Boolean(payload.onDuty),
        timestamp: new Date()
      });
      io.emit("agent:location", {
        userId: socket.user._id,
        name: socket.user.name,
        department: socket.user.department,
        latitude: entry.latitude,
        longitude: entry.longitude,
        timestamp: entry.timestamp,
        onDuty: entry.onDuty
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
