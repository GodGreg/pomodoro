const Redis = require("redis");
const env = require("dotenv").config();
const express = require("express");
const pomodoroRoutes = require("./routes/pomodoro");

const app = express();
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Server is online");
});

//prefix route for the routes
app.use("/pomodoro", pomodoroRoutes);

app.listen(4000, () => {
  console.log("Server is listening on port 4000");
});
