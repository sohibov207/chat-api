require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const dbPassword = process.env.DB_PASSWORD;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});