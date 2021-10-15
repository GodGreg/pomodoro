import { useMemo, useState, useCallback } from "react";
import * as PD from "./Requests/Pomodoro";
import usePromise from "./usePromise";
import PomodoroTable from "./PomodoroTable";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Spinner from "react-spinner-material";
import moment from "moment";
import { Add, Pause, PlayArrow } from "@material-ui/icons";

const Wrapper = styled.div`
  margin-top: 50px;
  padding: 0 136px;
  background-color: #FFFFF;
  margin: 5%;
  h1 {
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 36px;
    width: 90vw;
    margin: 0;
    text-align: left;
  }
  h4 {
    font-size: calc(10px + 2vmin);
    text-align: centre;
  }
  .table {
    max-width: 864px;
    margin: 0 auto;
  }
  table.MuiTable-root {
    border: 1px solid #cccccc;
  }
  a {
    text-decoration: none;
  }
  button {
    max-width: 200px;
    padding: 5px 5px;
    text-transform: none;
    font-size: 15px;
  }
  .buttons {
    display: flex;
  }
  .alignIcon {
    display: flex;
    align-items: end;
  }
  .loading {
    display inline-block;
    margin: auto;
  }
  .create {
    width: 400px;
    height: 56px;
    margin-right: 10px;
  }
  .pause {
    width: 120px;
    height: 30px;
    fontSize: 12px;
    marginRight: 20px;
    marginTop: 10px;
    background-color: red; 
  }
  .resume {
    width: 120px;
    height: 30px;
    fontSize: 12px;
    marginRight: 20px;
    marginTop: 10px;
    background-color: green;  
  }
  .textbox {
    margin-left: 20px;
    margin-right: 30px;
  }
  .textbox2 {
    margin-right: 20px;
    width: 1000px;
  }
  .textbox3 {
    width: 700px;
  }
`;

function convertToTableData(pomodoros, pause, resume) {
  pomodoros = pomodoros.sort((a, b) => moment(b.start) - moment(a.start));
  return pomodoros.map((p, index) => ({
    status: p.status,
    name: p.name + " (" + p.id + ")",
    start: p.start,
    finish: p.finish,
    action: (
      <div style={{ display: "flex", flexDirection: "row" }}>
        {p.status === "In Progress" ? (
          <Button
            key={"Resume_" + p.id}
            className={"pause"}
            variant="contained"
            color="secondary"
            onClick={() => pause(p.id)}
            startIcon={<Pause />}
          >
            Pause
          </Button>
        ) : p.status === "Paused" ? (
          <Button
            key={"Pause_" + p.id}
            className={"resume"}
            variant="contained"
            color="primary"
            onClick={() => resume(p.id)}
            startIcon={<PlayArrow />}
          >
            Resume
          </Button>
        ) : (
          p.status
        )}
      </div>
    ),
  }));
}

function Pomodoro() {
  const [pomodoros, refetch] = usePromise(
    PD.getAll,
    {},
    [], //Default Value
    [] //Dependency
  );

  const [duration, setDuration] = useState(10);
  const [webhook, setWebHook] = useState(
    "https://webhook.site/53b31946-97de-4e73-8a34-d096c8d7b662"
  );
  const [name, setName] = useState("");

  async function pause(id) {
    await PD.pause({ id });
    refetch({});
  }
  async function resume(id) {
    await PD.resume({ id });
    refetch({});
  }
  async function create() {
    let body = {
      name: name,
      webhook: webhook,
    };
    await PD.create({ databody: body, duration: duration });
    refetch({});
  }

  return (
    <Wrapper>
      {!pomodoros.isPending ? (
        <div>
          <div className="buttons">
            <h1 style={{ color: "black" }}>Pomodoros</h1>
            <TextField
              className={"textbox3"}
              id="name"
              label="Name"
              variant="outlined"
              defaultValue={name}
              onBlur={(e) => setName(e.target.value)}
            />
            <TextField
              className={"textbox"}
              id="duration"
              label="Duration"
              variant="outlined"
              defaultValue={duration}
              onBlur={(e) => setDuration(e.target.value)}
            />
            <TextField //Todo validate url
              className={"textbox2"}
              id="webhook"
              defaultValue={webhook}
              label="Webhook Url"
              variant="outlined"
              onBlur={(e) => setWebHook(e.target.value)}
            />
            <Button
              key={"Create Pomodoro"}
              className={"create"}
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={create}
            >
              Create
            </Button>
          </div>
          <div>
            <PomodoroTable
              pomodoros={pomodoros}
              data={convertToTableData(pomodoros.value, pause, resume)}
            />
          </div>
        </div>
      ) : (
        <div>
          <h4>Loading all Pomodoros...</h4>
          <div className={"loading"}>
            <Spinner radius={120} color={"#333"} stroke={2} visible={true} />
          </div>
        </div>
      )}
    </Wrapper>
  );
}

export default Pomodoro;
