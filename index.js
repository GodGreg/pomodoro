const Redis = require("redis");
const env = require("dotenv").config();
const express = require("express");
const db = require("./postgres");
const moment = require("moment");
const pomodoroRoutes = require("./routes/pomodoro");
const axios = require("axios");

const redisClient = Redis.createClient();

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

//Find all of the existing pomodoros and put them into redis
async function loadRedis() {
  redisClient.flushall();
  const pomodoro = await db.query("SELECT * FROM pomodoro");
  //console.log(pomodoro);
  pomodoro.rows.forEach((row) => {
    if (!row.pauseat) {
      let timer = Math.round(
        moment(row.finishat).diff(moment(), "seconds", true)
      );
      if (timer > 0) {
        redisClient.setex(row.pomodoro_id, timer, row.webhook);
      }
    }
  });
}

loadRedis();

function checkIfAnyExpired() {
  try {
    //Loops through all the keys in redis
    redisClient.keys("*", async (err, keys) => {
      if (err) return console.error(err);
      //Check if the key has expired
      keys.forEach((key) => {
        redisClient.ttl(key, async (err, res) => {
          if (err) return console.log("ERROR 2");
          console.log("ID: " + key + ", Time Remaining: " + res);
          //If the key has expired call the webhook
          if (res <= 0) {
            //Get the webhook
            redisClient.get(key, async (err, value) => {
              if (err) return console.error(err);
              try {
                console.log(value);
                await axios
                  .post(String(value), {
                    body: JSON.stringify({ Timer: "done", Completed: true }),
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  })
                  .then((response) => console.log("Successfully hit webhook"));
              } catch (e) {
                console.log("axios error");
              }
            });
          }
        });
      });
    });
  } catch (e) {
    console.log("BIG ERROR");
  }
}

//Create a timed loop to check if a pomodoro is done
//Use Redis for speed
setInterval(() => {
  console.log("-----");
  checkIfAnyExpired();
}, 1000);
