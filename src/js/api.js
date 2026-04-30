import { BACKEND_URL } from "./constants.js";

/** Request an endpoint on the backend API, for example: '/courses' */
export async function request(path, method = "GET", body) {
    const response = await fetch(`${BACKEND_URL}${!path.startsWith("/") ? "/" : ""}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        alert("An unexpected error occurred.");
    }

    return await response.json();
}

let user = null;

export async function logoutUser() {
    await request("/auth/logout", "DELETE");
    user = null;
}

export async function getUser() {
    if (user) return user;

    const result = await request("/auth/me");
    user = result.user;

    return user;
}
