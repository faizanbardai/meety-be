const express = require("express");
const passport = require("passport");
const cors = require("cors");

const mongooseConnection = require("./src/db/mongoose");
const bodyParser = require("body-parser");

const userRoute = require("./src/routes/user");
const eventRoute = require("./src/routes/event");

const listEndpoints = require("express-list-endpoints");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
mongooseConnection();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

app.use("/user", userRoute);
app.use("/event", eventRoute);

console.log(listEndpoints(app));

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
