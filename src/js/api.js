import { BACKEND_URL } from "./constants.js";

/** Request an endpoint on the backend API, for example: '/courses' */
export async function request(path, method = "GET") {
    const response = await fetch(
        `${BACKEND_URL}${!path.startsWith("/") ? "/" : ""}${path}`,
        {
            method,
            headers: { "Content-Type": "json" },
        },
    );

    if (!response.ok) {
        alert("An unexpected error occurred.");
    }

    return await response.json();
}
