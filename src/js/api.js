import { BACKEND_URL } from "./constants.js";

/** Request an endpoint on the backend API, for example: '/courses' */
export async function request(path, method = "GET") {
    const response = await fetch(
        `${BACKEND_URL}${!path.startsWith("/") ? "/" : ""}${path}`,
        {
            method,
            headers: { "Content-Type": "json" },
            credentials: "include",
        },
    );

    if (!response.ok) {
        alert("An unexpected error occurred.");
    }

    return await response.json();
}

let user = null;

export async function getUser() {
    if (user) return user;

    user = await request("/auth/me");
    return user;
}
