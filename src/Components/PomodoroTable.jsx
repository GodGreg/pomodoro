import React from "react";
import styled from "styled-components";
import MaterialTable from "material-table";
import { Paper } from "@material-ui/core";
import TableIcons from "./TableIcons";

const Container = styled(Paper)`
  table {
    border: 1px solid #cccccc;
  }
`;

const rowStyle = (row) => {
  if (row.status === "Completed") {
    return {
      border: "1px solid #cccccc",
      borderLeft: "10px solid #8fcb95",
    };
  } else if (row.status === "Paused") {
    return {
      border: "1px solid #cccccc",
      borderLeft: "10px solid #f08a99",
    };
  } else {
    return {
      border: "1px solid #cccccc",
      borderLeft: "10px solid #fff69a",
    };
  }
};

function PomodoroTable(props) {
  const columns = [
    {
      title: "Status",
      field: "status",
    },
    {
      title: "Name",
      field: "name",
    },
    { title: "Start", field: "start" },
    { title: "Finish", field: "finish" },
    { title: "Action", field: "action" },
  ];

  return (
    <div>
      <MaterialTable
        icons={TableIcons}
        components={{
          Container: (props) => <Container {...props} elevation={0} />,
        }}
        columns={columns}
        {...props}
        options={{
          pageSize: 10,
          rowStyle: rowStyle,
          search: true,
          showTitle: false,
          exportButton: { csv: true, pdf: true },
          exportAllData: true,
        }}
      />
    </div>
  );
}

export default PomodoroTable;
