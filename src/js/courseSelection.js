import { request } from "./api.js";

async function loadCourses() {
    try {
        const courses = await request("/courses");
        renderCourses(courses);
    } catch (err) {
        console.error("Failed to load courses: ", err);
    }
}

function renderCourses(courses) {
    const courseTitle = document.querySelector(".course-title");

    const durationHighlight = document.querySelector(".dur-highlight");

    const difficultyHighlight = document.querySelector(".diff-highlight");

    const skillsList = document.querySelector(".skills-list");

    courses.forEach((course) => {
        courseTitle.innerHTML = `${course.title}`;
        durationHighlight.innerHTML = `${course.durationHrs}`;
        difficultyHighlight.innerHTML = `${course.difficulty}`;

        course.skills.forEach((skill) => {
            const span = document.createElement("span");
            span.textContent = skill;
            span.className = "skill";
            skillsList.appendChild(span);
        });
    });
}

loadCourses();
