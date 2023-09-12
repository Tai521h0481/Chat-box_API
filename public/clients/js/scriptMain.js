const socket = io();

let currentUser = null;
const APIkey = "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";
const sound_joinRoom = new Audio("../../sounds/sound_joinRoom.mp3");
const sound_closeRoom = new Audio("../../sounds/sound_closeRoom.wav");

// sidebar menu
const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text"),
    searchBox = document.querySelector('.search-box input'),
    menuLinks = document.querySelector('.menu-links');

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
})

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light mode";
    } else {
        modeText.innerText = "Dark mode";
    }
});

const getUserByCookies = async () => {
    const res = await fetch("http://localhost:3000/api/authentication", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await res.json();
    return data;
}

async function init() {
    const data = await getUserByCookies();
    const res = await fetch(`http://localhost:3000/api/users/${data.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const user = await res.json();
    currentUser = user;
}

const removeCookies = async () => {
    const res = await fetch("http://localhost:3000/api/users/logout", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    return await res.json();
}

const logoutToMain = async () => {
    if(Clerk.user) {
        await Clerk.signOut();
    }
    const data = await removeCookies();
    if (data.error) {
        swal({
            title: "Error!",
            text: data.error,
            icon: "error",
            button: "OK",
        });
    }
    else {
        window.location.href = "index.html";
    }

}

const backToProfile = async () => {
    window.location.href = "profile.html";
}

const reloadMessage = async () => {
    await getAllMessageByIdRoom();
}

const hideMessage = async () => {
    const chatbox = document.querySelector('.chat__conversation-board');
    chatbox.innerHTML = "";
}

const saveMessage = async (message, userId, roomId, isLinkLocation, time) => {
    await fetch("http://localhost:3000/api/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, userId, roomId, isLinkLocation, time }),
    });
}

const createDate = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${month}-${now.getDate()} ${time}`;
    return date;
}

function scrollToBottom() {
    var chatConversationBoard = document.querySelector('#chat__conversation-board');
    chatConversationBoard.scrollTop = chatConversationBoard.scrollHeight;
}

const chat = async (avatar, nameUser, message, isLeft, date) => {
    let div = document.createElement('div');
    if (isLeft) {
        div.className = 'chat__conversation-board__message-container';
    } else {
        div.className = 'chat__conversation-board__message-container reversed';
    }
    div.innerHTML = `<div class="chat__conversation-board__message__time">${date}</div>`;
    const urlRegex = /^https?:\/\//;
    if (urlRegex.test(message)) {
        div.innerHTML += `<div class="chat__conversation-board__message__person">
                        <div class="chat__conversation-board__message__person__avatar"><img src="${avatar}" alt=${nameUser}/></div><span class="chat__conversation-board__message__person__nickname">${nameUser}</span>
                    </div>
                    <div class="chat__conversation-board__message__context">
                        <div class="chat__conversation-board__message__bubble"> <a href="${message}">${nameUser}'s Location</a></div>
                    </div>`;
    } else {
        div.innerHTML += `<div class="chat__conversation-board__message__person">
                        <div class="chat__conversation-board__message__person__avatar"><img src="${avatar}" alt=${nameUser}/></div><span class="chat__conversation-board__message__person__nickname">${nameUser}</span>
                    </div>
                    <div class="chat__conversation-board__message__context">
                        <div class="chat__conversation-board__message__bubble"> 
                        <span>${message}</span></div>
                    </div>`;
    }
    div.innerHTML += `</div>
    <div class="chat__conversation-board__message__options">
        <button class="btn-icon chat__conversation-board__message__option-button option-item emoji-button">
        <svg class="feather feather-smile sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        </button>
        <button class="btn-icon chat__conversation-board__message__option-button option-item more-button">
        <svg class="feather feather-more-horizontal sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
        </svg>
        </button>
    </div>`;
    const chatbox = document.querySelector('.chat__conversation-board');
    chatbox.appendChild(div);
    scrollToBottom();
}

const queryString = location.search;
const params = Qs.parse(queryString, { ignoreQueryPrefix: true });
const room = params['id-room'];
socket.emit("join-room", { idRoom: room });

const getIdRoomByNumberRoom = async () => {
    const data = await fetch(`http://localhost:3000/api/room/roomNumber/${room}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    return await data.json();
}

const setRoom = async () => {
    await init();
    const val = await getIdRoomByNumberRoom();
    await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: val.id }),
    });
    const titleRoom = document.getElementById('number_room');
    titleRoom.textContent = `Room ${val.roomNumber}`;
}

document
    .getElementById("send-message")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const message = document.getElementById("content-message").value;
        if (message === "") return;
        const date = createDate();
        await saveMessage(message, currentUser.id, currentUser.roomId, date);
        socket.emit("send-message", { message, infoUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar } });
        document.getElementById("content-message").value = "";
    });

socket.on("send-message", async ({ message, infoUser }) => {
    isLeft = infoUser.id !== currentUser.id;
    const date = createDate();
    chat(infoUser.avatar, infoUser.name, message, isLeft, date);
});

socket.on("send-location", async ({ lat, lng, infoUser }) => {
    const linkLocation = `https://www.google.com/maps?q=${lat},${lng}`;
    isLeft = infoUser.id !== currentUser.id;
    const date = createDate();
    chat(infoUser.avatar, infoUser.name, linkLocation, isLeft, date);
});

document.getElementById("btn-location").addEventListener("click", async function (e) {
    e.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const message = `https://www.google.com/maps?q=${lat},${lng}`;
            const date = createDate();
            await saveMessage(message, currentUser.id, currentUser.roomId, date);
            socket.emit("send-location", { lat, lng, infoUser: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar } });
        });
    } else {
        swal({
            title: "Error!",
            text: "Your browser does not support Geolocation",
            icon: "error",
            button: "OK",
        });
    }
});

// chatbot
$(function () {
    var INDEX = 0;
    $("#chat-submit").click(async function (e) {
        e.preventDefault();
        var msg = $("#chat-input").val();
        if (msg.trim() == '') {
            return false;
        }
        generate_message(msg, 'self', currentUser.avatar);
        //   var buttons = [
        //       {
        //         name: 'Existing User',
        //         value: 'existing'
        //       },
        //       {
        //         name: 'New User',
        //         value: 'new'
        //       }
        //     ];
        //   setTimeout(function() {      
        //     generate_message(msg, 'user');  
        //   }, 1000)

        generateAnswer(msg).then((data) => {
            if (data.status === 'success') {
                generate_message(data.data.outputs[0].text, 'user', 'http://localhost:3000/public/images/chatbot-avatar/chatgpt.jpg');
            } else {
                generate_message("I don't understand", 'user', 'http://localhost:3000/public/images/chatbot-avatar/chatgpt.jpg');
            }
        });
    })

    function generate_message(msg, type, avatar) {
        INDEX++;
        var str = "";
        str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
        str += "          <span class=\"msg-avatar\">";
        str += `            <img src= "${avatar}">`;
        str += "          <\/span>";
        str += "          <div class=\"cm-msg-text\">";
        str += "          <\/div>";
        str += "        <\/div>";

        // Create a new div element and set its innerHTML to the value of str
        var div = document.createElement('div');
        div.innerHTML = str;

        // Get the cm-msg-text element
        var cmMsgText = div.querySelector('.cm-msg-text');

        // Create a text node with the value of msg and append it to the cm-msg-text element
        var textNode = document.createTextNode(msg);
        cmMsgText.appendChild(textNode);

        // Append the new div element to the chat-logs element
        document.querySelector('.chat-logs').appendChild(div);

        $("#cm-msg-" + INDEX).hide().fadeIn(300);
        if (type == 'self') {
            $("#chat-input").val('');
        }
        $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    }

    function generate_button_message(msg, buttons) {
        /* Buttons should be object array 
          [
            {
              name: 'Existing User',
              value: 'existing'
            },
            {
              name: 'New User',
              value: 'new'
            }
          ]
        */
        INDEX++;
        var btn_obj = buttons.map(function (button) {
            return "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\"" + button.value + "\">" + button.name + "<\/a><\/li>";
        }).join('');
        var str = "";
        str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg user\">";
        str += "          <span class=\"msg-avatar\">";
        str += `            <img src= "http://localhost:3000/public/images/chatbot-avatar/chatgpt.jpg">`;
        str += "          <\/span>";
        str += "          <div class=\"cm-msg-text\">";
        str += "          <\/div>";
        str += "          <div class=\"cm-msg-button\">";
        str += "            <ul>";
        str += btn_obj;
        str += "            <\/ul>";
        str += "          <\/div>";
        str += "        <\/div>";

        // Create a new div element and set its innerHTML to the value of str
        var div = document.createElement('div');
        div.innerHTML = str;

        // Get the cm-msg-text element
        var cmMsgText = div.querySelector('.cm-msg-text');

        // Create a text node with the value of msg and append it to the cm-msg-text element
        var textNode = document.createTextNode(msg);
        cmMsgText.appendChild(textNode);

        // Append the new div element to the chat-logs element
        document.querySelector('.chat-logs').appendChild(div);
        $("#cm-msg-" + INDEX).hide().fadeIn(300);
        $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
        $("#chat-input").attr("disabled", true);
    }

    $(document).delegate(".chat-btn", "click", function () {
        var value = $(this).attr("chat-value");
        var name = $(this).html();
        $("#chat-input").attr("disabled", false);
        generate_message(name, 'self');
    })

    $("#chat-circle").click(function () {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
    })

    $(".chat-box-toggle").click(function () {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
    })

})


async function generateAnswer(question) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer gAAAAABk09QiJdKs_-FAV2dEvNDsku-W1jwE7fGPKgnL359OfmMuMzvW59f8EkdW07cNrAHnd22dlvZYdprWt3cn4Z2FBAw4mcsyw_OCT1ZbASn_2HhZPZydo-KNNV2IMU9NAGMtd5tz'
        },
        body: `{"max_tokens":512,"mode":"python","model":"icortex-1","n":1,"temperature":0,"text":"${question}"}`
    };
    try {
        const response = await fetch('https://api.textcortex.com/v1/codes', options);
        const data = await response.json();
        return data;
    } catch (error) {
        return { status: 'error', data: error };
    }
}

const displayUserInRoom = async (allUsersInRoom) => {
    await init();
    let ul = document.querySelector('.menu-links');
    let s = "";
    allUsersInRoom.forEach((data) => {
        s += `<li class="nav-link view-profile" data-user-view="${currentUser.id}" data-user-id="${data.id}">
                <a href="#">
                    <img class='bx icon' src="${data.avatar}" alt="">
                    <span class="text nav-text">${data.name}</span>
                </a>
            </li>`;
    });
    ul.innerHTML = s;

    const viewProfiles = document.querySelectorAll('.view-profile');
    viewProfiles.forEach((profile) => {
        profile.addEventListener('click', function () {
            const userId = this.dataset.userId;
            const idUserView = this.dataset.userView;
            window.location.href = `view_profile.html?userId=${userId}&&idUserView=${idUserView}`;
        });
    });
}

const fetchToGetMessage = async () => {
    const res = await fetch(`http://localhost:3000/api/message/roomNumber/${currentUser.roomId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await res.json();
    return data;
}

const getAllMessageByIdRoom = async () => {
    let allMessage = await fetchToGetMessage();
    if (allMessage.length === 0) {
        allMessage = await fetchToGetMessage();
    };
    allMessage.forEach((m) => {
        isLeft = m.id !== currentUser.id;
        const date = new Date(m.createdAt);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dateMessage = `${date.getFullYear()}-${month}-${date.getDate()} ${time}`;
        chat(m.avatar, m.name, m.message, isLeft, dateMessage);
    });
}

socket.on("new-user-join", async () => {
    sound_joinRoom.play();
    await setRoom();
    socket.emit("set-socketId", { idUser: currentUser.id });
    socket.emit("get-all-user-in-room");
})

socket.on("allMember", (allUsersInRoom) => {
    displayUserInRoom(allUsersInRoom);
})

socket.on("user_disconnect", async (allUsersInRoom) => {
    sound_closeRoom.play();
    displayUserInRoom(allUsersInRoom);
})

searchBox.addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    for (const li of menuLinks.children) {
        const navText = li.querySelector('.nav-text');
        if (navText.textContent.toLowerCase().includes(searchText)) {
            li.style.display = '';
        } else {
            li.style.display = 'none';
        }
    }
});