const API = "http://localhost:8000";

// 🔑 Start Google login
function loginWithGoogle() {
    window.location.href = API + "/auth/login";
}

// ✅ Check if already logged in
async function checkLogin() {
    const res = await fetch(API + "/auth/me", {
        credentials: "include"
    });

    const data = await res.json();

    if (data.user) {
        // already logged in → go to courses page
        window.location.href = "/courses";
    }
}

checkLogin();