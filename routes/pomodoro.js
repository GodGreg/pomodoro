const express = require("express");
const router = express.Router();
const db = require("../postgres");
const moment = require("moment");
const calculateNewFinishTime = require("./helper.js");
const Redis = require("redis");
const redisClient = Redis.createClient();

/* CREATE

Creates a new pomodoro starting at the current time for the specified duration in SECONDS
*/
router.post("/:duration", async (req, res) => {
  //Handle Errors
  if (!req.params.duration) {
    res
      .status(400)
      .send(
        "Bad Request. Missing param duration (/pomodoro/:duration/:webhook)"
      );
    return;
  }
  if (!req.body.webhook) {
    res.status(400).send("Bad Request.  Missing webhook field in body");
    return;
  }
  if (!req.body.name) {
    res.status(400).send("Bad Request. Missing name field in body");
    return;
  }
  //Add new entry in db
  try {
    const start = moment().toString();
    const finish = moment(start).add(req.params.duration, "seconds").toString();

    const pomodoro = await db.query(
      "INSERT INTO pomodoro (name, startAt, pauseAt, finishAt, webhook) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.body.name, start, null, finish, req.body.webhook]
    );
    await redisClient.setex(
      pomodoro.rows[0].pomodoro_id,
      req.params.duration,
      req.body.webhook
    );
    //Return the whole object inserted
    res.json(pomodoro.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json(err.message);
  }
});

//Get all
router.get("/", async (req, res) => {
  try {
    const pomodoro = await db.query("SELECT * FROM pomodoro");
    res.json(pomodoro.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* STATUS
  
  Returns:
  - name
  - status ("Completed" || "In Progress" || "Paused")
  - start 
  - finish (finish time || null)
  - pausedAt (paused time || null)
  - remaining (json object with the remaining time)
  */
router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send("Bad Request. Missing param id");
    return;
  }
  try {
    //Get the pomodoro by id from the db
    let pomodoro = await db.query(
      "SELECT * FROM pomodoro WHERE pomodoro_id = ($1)",
      [req.params.id]
    );
    pomodoro = pomodoro.rows[0];

    //Returns true if finishat is before the current date
    let completed = moment(pomodoro.finishat).isBefore(moment());

    //Calculate Time Remaining
    //Add the amount of time since the pause (if not null) to the finish time
    const newFinishAt = calculateNewFinishTime(
      moment(pomodoro.finishat),
      moment(pomodoro.pauseat)
    );
    let remaining = moment.duration(moment(newFinishAt).diff(moment()));

    let result = {
      name: pomodoro.name,
      status: pomodoro.pauseat
        ? "Paused"
        : completed
        ? "Completed"
        : "In Progress",
      start: pomodoro.startat,
      finish: pomodoro.finishat,
      newFinish: newFinishAt,
      pausedAt: pomodoro.pauseat,
      remaining: {
        years: remaining.years(),
        months: remaining.months(),
        days: remaining.days(),
        hours: remaining.hours(),
        minutes: remaining.minutes(),
        seconds: remaining.seconds(),
      },
    };
    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* PAUSE
  If time is paused do nothing (paused != null)
  
  Updates:
  - Pause = currentTime
  
  Note: You can not pause a completed timer
  */
router.put("/pause/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send("Bad Request. Missing param id");
    return;
  }

  try {
    //Get the pomodoro by id from the db
    let pomodoro = await db.query(
      "SELECT * FROM pomodoro WHERE pomodoro_id = ($1)",
      [req.params.id]
    );
    pomodoro = pomodoro.rows[0];

    //Returns true if finishat is before the current date
    let completed = moment(pomodoro.finishat).isBefore(moment());

    if (pomodoro.pauseat) {
      //304 Not Modified
      res.status(304).send("Timer already paused");
      return;
    }
    if (completed) {
      //304 Not Modified
      res.status(304).send("Timer already completed");
      return;
    }

    const pause = moment().toString();

    //Update the db
    try {
      const pomodoro = await db.query(
        "UPDATE pomodoro SET pauseat = ($1) WHERE pomodoro_id = ($2)",
        [pause, req.params.id]
      );
      redisClient.del(req.params.id);
      res.send("PAUSED");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* RESUME
  If time is not paused does nothing (pause == null)
  
  Updates:
  - finish = finish + (current - pause)
  - pause = null
  */
router.put("/resume/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send("Bad Request. Missing param id");
    return;
  }
  try {
    //Get the pomodoro by id from the db
    let pomodoro = await db.query(
      "SELECT * FROM pomodoro WHERE pomodoro_id = ($1)",
      [req.params.id]
    );
    pomodoro = pomodoro.rows[0];

    if (!pomodoro.pauseat) {
      //304 Not Modified
      res.status(304).send("Timer not paused");
    }

    //Add the amount of time since the pause (if not null) to the end time
    const newFinishAt = calculateNewFinishTime(
      moment(pomodoro.finishat),
      moment(pomodoro.pauseat)
    );

    //Update the db
    try {
      await db.query(
        "UPDATE pomodoro SET pauseat = ($1), finishat = ($2) WHERE pomodoro_id = ($3)",
        [null, newFinishAt, req.params.id]
      );
      console.log(pomodoro.webhook);
      await redisClient.setex(
        pomodoro.pomodoro_id,
        Math.round(moment(newFinishAt).diff(moment(), "seconds", true)),
        pomodoro.webhook
      );
      res.send("RESUMED");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
