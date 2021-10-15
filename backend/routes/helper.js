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

function prettyReturn(pomodoro) {
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
    id: pomodoro.pomodoro_id,
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
  return result;
}

module.exports = {
  calculateNewFinishTime: calculateNewFinishTime,
  prettyReturn: prettyReturn,
};
