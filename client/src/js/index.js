const messageText = document.querySelector("#messageText");
const chatForm = document.querySelector("#chat-form");
const messageContainer = document.querySelector("#chatMessages");
const usernameInput = document.querySelector("#username");
const joinBtn = document.querySelector("#joinBtn");
let username;

joinBtn.addEventListener("click", (e) => {
  e.preventDefault();
  username = usernameInput.value;
  const socket = new WebSocket("ws://localhost:5000");

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ event: "username", payload: username }));
  });

  socket.addEventListener("message", function (event) {
    addMessage(JSON.parse(event.data));
  });

  function addMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p>${message.text}</p>`;

    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = {
      event: "message",
      username: username,
      msg: e.target.elements.messageText.value,
    };
    socket.send(JSON.stringify(msg));
    e.target.elements.messageText.value = "";
    e.target.elements.messageText.focus();
  });
});
