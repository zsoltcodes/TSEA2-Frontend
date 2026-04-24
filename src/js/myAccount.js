import { getUser, request } from "./api.js";

const editDisplayNameBtn = document.getElementById("edit-dsp-name");
const editDspImgBtn = document.getElementById("edit-dsp-img");
const pointsInput = document.getElementById("points");
const imgDisplay = document.getElementById("img-here");
const imgInput = document.getElementById("hidden-input");
const signoutBtn = document.getElementById("signout-btn");
const emailAd = document.getElementById("email-input");

let isEditing = false;

signoutBtn.addEventListener("click", async () => {
    try {
        request("/logout", 'POST'); // Need backend implementation
    } catch (err) {
        console.error("Logout request failed:", err);
    }
})

editDisplayNameBtn.addEventListener("click", () => {
    const displayName = document.getElementById("username");

    if (!displayName) { throw new Error("Couldn't retrieve display name element"); return; }

    if (!isEditing) {
        isEditing = true;
        displayName.disabled = false;
        displayName.type = "text";

        editDisplayNameBtn.value = "Apply Changes";
    } else if (isEditing) {
        isEditing = false;

        displayName.disabled = true;

        editDisplayNameBtn.value = "Edit display name";
    }
})

editDspImgBtn.addEventListener("click", () => {
    imgInput.click();
})

imgInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // [testing] console.log(reader)
    // note: selected image is at reader.result

    reader.onload = () => {
        imgDisplay.src = reader.result;
    }

    reader.readAsDataURL(file);
})

async function loadUserInfo() {
    const result = await getUser();

    const points = result.user.points;
    const emailVal = result.user.email;
    
    pointsInput.value = `${points}`;
    emailAd.value = `${emailVal}`;
}

loadUserInfo();

