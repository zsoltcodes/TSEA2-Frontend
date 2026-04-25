import { getUser } from "../../js/api.js";

async function loadHeader() {
    const user = await getUser();
    if (!user || !user.user) return;

    const accountBtn = document.getElementById("account-btn");
    accountBtn.textContent = "My Account";
    accountBtn.href = "/src/pages/myAccount.html";
}

loadHeader();
