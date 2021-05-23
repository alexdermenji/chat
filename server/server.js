const ws = require("ws"); //import WebSocket package
const moment = require("moment");

const wss = new ws.Server(
  {
    port: 5000,
  },
  () => {
    console.log("Server is running on PORT 5000");
  }
);

const users = [];
let username;

//transform text to objects

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

function userJoin(id, username) {
  const user = { id, username };
  users.push(user);

  return user;
}

function getCurrentUser(id) {
  return users.find((user) => {
    user.id === id;
  });
}

function userLeave() {
  const index = users.findIndex((user) => users.username === user.username);
  if (index !== -1) {
    return users.splice(index, 1);
  }
}

wss.on("connection", function connection(ws) {
  ws.on("message", (msg) => {
    const msgObj = JSON.parse(msg);
    if (msgObj.event === "username") {
      username = msgObj.payload;
      const user = userJoin(users.length, username);
      console.log(user, users);

      //welcome current user
      ws.send(
        JSON.stringify(
          formatMessage("ChatBot", `${user.username} Welcome to the chat`)
        )
      );

      //broadcast to all clients exept joiner, that user has joined
      wss.clients.forEach((client) => {
        if (client !== ws) {
          client.send(
            JSON.stringify(
              formatMessage("chatBot", `${user.username} has joined our chat`)
            )
          );
        }
      });

      ws.on("close", function () {
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify(
              formatMessage("chatBot", `${user.username} has left the chat`)
            )
          );
        });
      });
    } else {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(formatMessage(msgObj.username, msgObj.msg)));
      });
    }
  });
});
