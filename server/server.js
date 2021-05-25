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

let users = [];
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

function userList(users) {
  return {
    event: "userList",
    payload: users,
  };
}

wss.on("connection", function connection(ws) {
  ws.on("message", (msg) => {
    const msgObj = JSON.parse(msg);
    if (msgObj.event === "username") {
      username = msgObj.payload;
      const user = userJoin(moment().format("hh:mm:ss"), username);

      wss.clients.forEach((client) => {
        client.send(JSON.stringify(userList(users)));
      });

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
        for (let i = 0; i < users.length; i++) {
          if (users[i].id === user.id) {
            users.splice(i, 1);
          }
        }

        wss.clients.forEach((client) => {
          client.send(JSON.stringify(userList(users)));
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
