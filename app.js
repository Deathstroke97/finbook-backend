const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const projectRoutes = require("./routes/project");

const MONGODB_URI =
  "mongodb+srv://Azat:wilsonslade@cluster0-sqi3q.mongodb.net/finbook";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use(categoryRoutes);
app.use(projectRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const message = error.message;
  const status = error.statusCode || 500;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("success");
    app.listen(8081);
  })
  .catch((err) => console.log(err));
