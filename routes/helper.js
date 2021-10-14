const moment = require("moment");

function calculateNewFinishTime(finish, pause) {
  //If the pomodoro is not paused then simply return the finish time
  if (!pause) {
    return finish;
  }
  //Add the amount of time since the pause to the end time
  let currentTime = moment();
  let difference = currentTime.diff(pause, "seconds", true);

  const newFinishAt = finish.add(difference, "seconds").toString();
  return newFinishAt;
}

module.exports = calculateNewFinishTime;
