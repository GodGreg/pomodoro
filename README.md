# Pomodoro

### Setup
1. Clone
2. `sudo apt-get install redis npm nodejs`
3. `npm install`
4. `npm run dev` -> Starts a redis server, node server and then the react frontend (in that order)

### Tech Stack
Frontend: react.js, materialUI

Backend: node.js, express.js

DBs: postgresql, redis

---------------------------------------------------------------------------

Implementation of a [pomodoro](https://en.wikipedia.org/wiki/Pomodoro_Technique) timer 

Published postman endpoints: https://documenter.getpostman.com/view/9650075/UV5Ukeor

Actions:
- Create -> consumes a duration and a webhook to be called upon completion
- Status -> returns the current state of the timer (in a pretty format)
- GetAll -> returns the status of all timers
- Pause -> pause a timer
- Resume -> resume a paused timer
