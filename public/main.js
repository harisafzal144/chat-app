const socket = io();

const inboxPeople = document.querySelector('.inbox__people');
const inputField = document.querySelector('.message_form__input');
const messageForm = document.querySelector('.message_form');
const messageBox = document.querySelector('.messages__history');
const fallback = document.querySelector('.fallback');

let userName = '';
//new user from client side
const newUserConnected = (user) => {
  let new_user = prompt('Enter Name');
  userName = new_user || `User${Math.floor(Math.random() * 1000000)}`;
  //discharge from client to node server
  socket.emit('new user', userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString('en-US');

  const receivedMsg = `
    <div class="incoming__message">
      <div class="received__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="message__author">${user}</span>
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>`;

  const myMsg = `
    <div class="outgoing__message">
      <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!inputField.value) {
    console.log('input is empty');
    return;
  }

  socket.emit('chat message', {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = '';
  socket.emit('typing', {
    isTyping: false,
    nick: userName,
  });
});

inputField.addEventListener('keyup', () => {
  socket.emit('typing', {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });
});

socket.on('new user', function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on('user disconnected', function (userName) {
  console.log(` Left chat`, 'user disconnected');
  addNewMessage({ user: userName, message: `${userName} Left chat` });
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on('chat message', function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});

socket.on('typing', function (data) {
  console.log(data, 'inside typing');
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = '';
    return;
  } else {
    fallback.innerHTML = `<p>${nick} is typing...</p>`;
  }
});
