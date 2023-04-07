const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { login, register } = require("./controllers/auth");
const { updateUserRole } = require("./controllers/user");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

app.put("/updateUserRole", updateUserRole);

app.post("/login", login);

app.post("/register", register);

module.exports = app;
