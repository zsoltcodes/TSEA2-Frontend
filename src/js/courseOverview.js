import { request } from "./api.js";
import { PAGE_TITLE_PREFIX } from "./constants.js";
import { openContentPage, getIconUrlFromCourseContentType } from "./content.js";

function decodeCourse() {
    const queryParams = new URLSearchParams(window.location.search);
    const courseSlug = decodeURIComponent(queryParams.get("course"));
    if (!courseSlug) {
        alert("No course specified");
        window.history.back();
    }

    return courseSlug;
}

const courseSlug = decodeCourse();

const difficultyBars = [
    document.querySelector(".difficulty .bar-1"),
    document.querySelector(".difficulty .bar-2"),
    document.querySelector(".difficulty .bar-3"),
];

/** Updates the difficulty icon with the specified difficulty (1-3) */
function styleDifficultyBar(difficulty) {
    const activeBarIdx = Math.min(
        difficultyBars.length - 1,
        Math.max(0, difficulty - 1),
    );

    for (let i = 0; i < difficultyBars.length; i++) {
        const bar = difficultyBars[i];
        if (i == activeBarIdx) {
            bar.style.fill = "var(--skill-bar-active)";
            continue;
        }

        bar.style.fill = "var(--skill-bar-inactive)";
    }
}

const durationTextEl = document.querySelector(".meta-duration .circle-text");

/** Sets the text of the duration circle text icon */
function setDurationText(text) {
    durationTextEl.textContent = text;
}

const skillsContainer = document.getElementById("features-container");

/** Adds a skill to the skill container */
function addSkill(skillText) {
    const courseSkill = document.createElement("div");
    courseSkill.className = "course-skill";

    const checkIcon = document.createElement("img");
    checkIcon.src = "/public/circle-check-solid-full.svg";
    checkIcon.style.width = "30px";

    const skillPara = document.createElement("p");
    skillPara.textContent = skillText;

    courseSkill.appendChild(checkIcon);
    courseSkill.appendChild(skillPara);

    skillsContainer.appendChild(courseSkill);
}

const contentsContainer = document.getElementById("course-contents");

/** Add course content row to the content list table */
function addCourseContentRow(content) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    const container = document.createElement("div");
    const leftContainer = document.createElement("div");

    const icon = document.createElement("img");
    icon.src = getIconUrlFromCourseContentType(content.type);
    icon.width = 40;

    const p = document.createElement("p");
    p.textContent = content.title;

    const arrow = document.createElement("img");
    arrow.src = "/public/angle-right-solid-full.svg";
    arrow.width = 40;

    leftContainer.appendChild(icon);
    leftContainer.appendChild(p);

    container.appendChild(leftContainer);
    container.appendChild(arrow);

    td.appendChild(container);
    tr.appendChild(td);

    tr.addEventListener("click", () => {
        openContentPage(content);
    });

    contentsContainer.appendChild(tr);
}

/** Loads the course provided in the query parameters and populates the page */
async function loadCourse() {
    const course = await request(`/courses/${courseSlug}`);
    if (!course) {
        alert(`Could not find course: '${courseSlug}'`);
        window.history.back();
    }

    document.title = PAGE_TITLE_PREFIX + course.title;

    const courseTitleEl = document.getElementById("course-title");
    const courseDescriptionEl = document.getElementById("course-description");

    courseTitleEl.textContent = course.title;
    courseDescriptionEl.textContent = course.description;

    styleDifficultyBar(course.difficulty);
    setDurationText(course.durationHrs);

    for (const skill of course.skills) {
        addSkill(skill);
    }

    for (const content of course.contents) {
        addCourseContentRow(content);
    }

    const startBtn = document.getElementById("start-btn");
    startBtn.addEventListener("click", () => {
        openContentPage(course.contents[0]);
    });
}

loadCourse();
