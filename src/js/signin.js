import { BACKEND_URL } from "./constants.js";

const authBtn = document.querySelector(".auth-btn");
authBtn.addEventListener("click", () => {
    window.location.assign(BACKEND_URL + "/auth/login");
});
