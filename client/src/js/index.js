const messageText = document.querySelector("#messageText");
const chatForm = document.querySelector("#chat-form");
const messageContainer = document.querySelector("#chatMessages");
const usernameInput = document.querySelector("#username");
const joinBtn = document.querySelector("#joinBtn");
const user = document.querySelector("#current-user");
const usersList = document.querySelector("#users-list");
const auth = document.querySelector(".join-container");
const chat = document.querySelector(".chat-container");
const imageUploder = document.querySelector(".chat__file-upload");
const imageDropZone = imageUploder.closest(".chat__avatar");
const userProfile = { image: "../img_avatar.png" };

let username;

joinBtn.addEventListener("click", (e) => {
  auth.classList.add("hidden");
  chat.classList.remove("hidden");
  e.preventDefault();
  username = usernameInput.value;
  user.textContent = username;
  const socket = new WebSocket("ws://localhost:5000");

  //avatar
  imageDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageDropZone.classList.add("chat__avatar--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    imageDropZone.addEventListener(type, (e) => {
      imageDropZone.classList.remove("chat__avatar--over");
    });
  });

  imageDropZone.addEventListener("click", (e) => {
    imageUploder.click();
  });

  imageUploder.addEventListener("change", (e) => {
    if (imageUploder.files.length) {
      updateImage(imageUploder.files[0]);
    }
  });

  imageDropZone.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      imageUploder.files = e.dataTransfer.files;
      updateImage(e.dataTransfer.files[0]);
    }
    imageDropZone.classList.remove("chat__avatar--over");
  });

  function updateImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      imageDropZone.style.backgroundImage = `url('${reader.result}')`;
      userProfile.image = reader.result;
    };
  }

  ///sockets

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ event: "username", payload: username }));
  });

  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);
    if (data.event === "userList") {
      usersList.innerHTML = "";
      data.payload.forEach((user) => {
        const li = document.createElement("li");
        li.innerHTML = user.username;
        usersList.appendChild(li);
      });
    } else {
      addMessage(JSON.parse(event.data));
    }
  });

  function addMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <div class="meta"><div class="message__avatar" data-id="${message.username}"></div> <div class="message__user">${message.username}</div>  <span>${message.time}</span></div>
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
