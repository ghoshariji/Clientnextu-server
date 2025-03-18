const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Database connection (replace with actual configuration)
const db = require("./db/dbConn");
db();

// Import routes
const userRoute = require("./route/userRoute");
const poolRoute = require("./route/poolRoute");

// Static files
app.use(express.static(path.join(__dirname, "./docs")));

// Routes
app.use("/api/auth/user/v1", userRoute);
app.use("/api/auth/pool", poolRoute);


app.get("/",(req,res)=>{
  console.log("Come")
  res.send("hello")
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
