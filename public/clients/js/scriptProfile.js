const socket = io();
let data_user = null;

const checkAuthen = async () => {
    const user = await fetch("http://localhost:3000/api/authentication", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
    if (user.error) {
        window.location.href = "index.html";
    }
}

window.onload = async () => {
    await checkAuthen();
}

const displayProfile = () => {
    fetch("http://localhost:3000/api/authentication", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
        .then(async (data) => {
            data_user = data;
            const user = await fetch(`http://localhost:3000/api/users/${data.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json());
            const nameText = document.getElementById("name-text");
            const avt = document.getElementById("avatar-image");
            const follower = document.getElementById("follower");
            const liked = document.getElementById("like");
            const disliked = document.getElementById("dislike");
            follower.textContent = user.follower;
            liked.textContent = user.liked;
            disliked.textContent = user.disliked;
            avt.src = user.avatar;
            nameText.textContent = user.name;
        });
}

displayProfile();

const showInputAndButtons = () => {
    document.getElementById("open-message").style.display = "block";
}

const updateAvatar = async (event) => {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = async function (e) {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            fetch(`http://localhost:3000/api/users/upload-avatar/${data_user.id}`, {
                method: 'POST',
                body: formData
            }).then(res => res.json())
                .then(data => {
                    if (data.error) {
                        swal({
                            title: "Error!",
                            text: "file is not support",
                            icon: "error",
                            button: "OK",
                        });
                    } else {
                        document.getElementById("avatar-image").src = e.target.result;
                        swal({
                            title: "Success!",
                            text: "Upload avatar successfully",
                            icon: "success",
                            button: "OK",
                        });
                    }
                });
        }
        catch (error) {
            swal({
                title: "Error!",
                text: "An error occurred while uploading the avatar (maybe the file is too big or the file is not support)",
                icon: "error",
                button: "OK",
            });
        }
    }
    reader.readAsDataURL(file);
    displayProfile();
}

const editName = () => {
    const nameText = document.getElementById("name-text");
    const nameInput = document.getElementById("name-input");
    const btnSave = document.getElementById("btn-save");
    btnSave.classList.remove("d-none");
    nameInput.value = nameText.textContent;
    nameText.classList.add("d-none");
    nameInput.classList.remove("d-none");
    nameInput.focus();
}

const saveName = () => {
    const nameText = document.getElementById("name-text");
    const nameInput = document.getElementById("name-input");
    const btnSave = document.getElementById("btn-save");
    nameText.textContent = nameInput.value;
    nameText.classList.remove("d-none");
    nameInput.classList.add("d-none");
    btnSave.classList.add("d-none");
    console.log(data_user.id);
    fetch(`http://localhost:3000/api/users/${data_user.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nameInput.value, id: data_user.id }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                swal({
                    title: "Error!",
                    text: data.error,
                    icon: "error",
                    button: "OK",
                });
            }
        });
}

const logout = async () => {
    if(Clerk.user) {
        await Clerk.signOut();
    }
    await fetch("http://localhost:3000/api/users/logout", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
        .then((data) => {
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
        });
}

document.getElementById("join-room").addEventListener("click", async (e) => {
    const room = document.getElementById("id-room").value;
    await fetch(`http://localhost:3000/api/room`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ room }),
    })
});