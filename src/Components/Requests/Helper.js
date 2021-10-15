let proxy = process.env.REACT_APP_SERVER_DEVELOPMENT;
async function GET(url) {
  const response = await fetch(proxy + url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const body = await response.json();
  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

async function POST(url, databody) {
  const response = await fetch(proxy + url, {
    method: "POST",
    body: JSON.stringify(databody),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const body = response.json();
  if (!response.ok) {
    const err = await body;
    throw Error(err.message);
  }
  return body;
}

async function PUT(url, databody) {
  const response = await fetch(proxy + url, {
    method: "PUT",
    body: JSON.stringify(databody),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log({ response });
  const body = response.json();
  if (!response.ok) {
    throw Error(body.message);
  }
  return body;
}

async function PATCH(url, databody) {
  const response = await fetch(proxy + url, {
    method: "PATCH",
    body: JSON.stringify(databody),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const body = response.json();
  if (!response.ok) {
    throw Error(body.message);
  }
  return body;
}

async function DELETE(url, filepath) {
  const response = await fetch(proxy + url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const body = response.json();
  if (!response.ok) {
    throw Error(body.message);
  }
  return body;
}

export { PUT, GET, POST, PATCH, DELETE };
