require("dotenv").config();
const http = require("http");
const express = require("express");
const db = require("./src/models");
const { initializeSocket } = require("./src/sockets/index");

const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running smoothly",
    environment: NODE_ENV,
  });
});

const authRoutes = require("./src/routes/auth.route");
const conversationRoutes = require("./src/routes/conversation.route");
const messageRoutes = require("./src/routes/message.route");
app.use("/api/auth", authRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/conversation/messages", messageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

initializeSocket(server);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("PostgreSQL database connected successfully.");

    await db.sequelize.sync({ force: false });
    console.log("Database models synchronized.");

    server.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
