const fs = require("fs");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const businessRoutes = require("./routes/business");
const categoryRoutes = require("./routes/category");
const projectRoutes = require("./routes/project");
const contractorRoutes = require("./routes/contractor");
const obligationRoutes = require("./routes/obligation");
const accountRoutes = require("./routes/account");
const transferRoutes = require("./routes/transfer");
const transactionRoutes = require("./routes/transaction");
const reportRoutes = require("./routes/reports");

// const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-sqi3q.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const MONGODB_URI = `mongodb+srv://Azat:wilsonslade@cluster0-sqi3q.mongodb.net/finbook`;

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(bodyParser.json());
// app.use(helmet());
// app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/auth", authRoutes);
app.use(businessRoutes);
app.use(userRoutes);
app.use(categoryRoutes);
app.use(projectRoutes);
app.use(contractorRoutes);
app.use(obligationRoutes);
app.use(accountRoutes);
app.use(transferRoutes);
app.use(transactionRoutes);
app.use(reportRoutes);

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

// mongoose
//   .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
//   .then(() => {
//     console.log("connected to database");
//     https
//       .createServer({ key: privateKey, cert: certificate }, app)
//       .listen(process.env.PORT || 8081);
//   })
//   .catch((err) => console.log(err));

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("connected to database");
    const port = process.env.PORT || 8081;
    app.listen(port);
    console.log("Server is started on PORT: ", port);
  })
  .catch((err) => console.log(err));
