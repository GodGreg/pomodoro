const Redis = require("redis");
const express = require("express");
const db = require("./postgres");
const moment = require("moment");
const pomodoroRoutes = require("./routes/pomodoro");
const axios = require("axios");
const cors = require("cors");

const redisClient = Redis.createClient();

const app = express();

//------------------------------------------------------------------------------
//CORS
//------------------------------------------------------------------------------
//CORS must load before everything else

//A list of websites that can access the data for the api calls.(CORS)
const whitelist = ["http://localhost:3000", "https://localhost:3000"];
//Include "cors(corsOptions)" to protect the endpoint
//Example: app.get('/api/questions', cors(corsOptions), (req, res) => {
const corsOptions = {
  origin: function (origin, callback) {
    //If the url trying to query our endpoints is not in the whitelist, deny access
    if (whitelist.indexOf(origin) !== -1 || true) {
      //Added true to use postman
      callback(null, true);
    } else {
      callback(new Error("Access Denied by the 'Cookie Monster' NOM NOM NOM"));
    }
  },
};
app.use(cors(corsOptions));
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
          if (res <= 1) {
            console.log("Timer Finished: " + key);
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
            redisClient.del(key);
          }
        });
      });
    });
  } catch (e) {
    console.log("Error checking for expired timers");
  }
}

//Create a timed loop to check if a pomodoro is done
//Use Redis for speed
setInterval(() => {
  console.log("-----");
  checkIfAnyExpired();
}, 1000);
