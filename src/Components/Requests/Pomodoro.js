import { GET, POST, PUT } from "./Helper";

async function create({ databody, duration }) {
  return POST(`/pomodoro/${duration}`, databody);
}

async function status({ id }) {
  return GET(`/pomodoro/${id}`);
}

async function getAll() {
  return GET(`/pomodoro`);
}

async function pause({ id }) {
  return PUT(`/pomodoro/pause/${id}`, {});
}

async function resume({ id }) {
  return PUT(`/pomodoro/resume/${id}`, {});
}

export { create, status, pause, resume, getAll };
