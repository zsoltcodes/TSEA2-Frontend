import { request } from "./api.js";

const courseListEl = document.querySelector(".course-list");

async function loadPage() {
    const courses = await loadCourses();
    renderCourses(courses);

    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("input", async (e) => {
        clearCourses();

        const normalisedSearchTerm = e.target.value.trim().toLowerCase();
        const results = courses.filter((c) => c.title.trim().toLowerCase().includes(normalisedSearchTerm));
        if (results.length == 0) {
            courseListEl.innerHTML = "<p style='color: black;'>No courses found for that search term.</p>";
            return;
        }

        renderCourses(courses.filter((c) => c.title.trim().toLowerCase().includes(normalisedSearchTerm)));
    });
}

async function loadCourses() {
    try {
        return await request("/courses");
    } catch (err) {
        console.error("Failed to load courses: ", err);
    }
}

function createCourseDetail(parentEl, iconUrl, doText = true) {
    const container = document.createElement("div");
    container.className = "course-detail-container";

    const icon = document.createElement("img");
    icon.className = "course-detail-icon";
    icon.src = iconUrl;
    icon.style.width = "40px";

    container.appendChild(icon);

    let text = null;
    let highlight = null;

    if (doText) {
        text = document.createElement("span");
        text.className = "course-detail-text";

        container.appendChild(text);

        highlight = document.createElement("div");
        highlight.className = "course-detail-highlight";

        text.appendChild(highlight);
    }

    parentEl.appendChild(container);
    return { container, icon, text, highlight };
}

function clearCourses() {
    courseListEl.innerHTML = "";
}

function renderCourses(courses) {
    courses.forEach((course) => {
        const courseCard = document.createElement("div");
        courseCard.className = "course-card";

        const courseTitle = document.createElement("h1");
        courseTitle.className = "course-title";
        courseCard.appendChild(courseTitle);

        const { highlight: durationHighlight } = createCourseDetail(courseCard, "../../public/clock.png");
        const { highlight: difficultyHighlight } = createCourseDetail(courseCard, "../../public/newbie.png");

        const { container: linkContainer, icon: linkIcon } = createCourseDetail(
            courseCard,
            "../../public/external-link.png",
            false,
        );

        const link = document.createElement("a");
        link.textContent = "Take me to the course";
        link.className = "course-link";
        link.href = `./course-overview.html?course=`;
        linkIcon.style.width = "30px";

        linkContainer.prepend(link);

        courseTitle.textContent = course.title;
        durationHighlight.textContent = "Duration: " + course.durationHrs + " Hours";
        difficultyHighlight.textContent =
            "Difficulty: " + (course.difficulty == 1 ? "Easy" : course.difficulty == 2 ? "Medium" : "Hard");

        link.href = `./course-overview.html?course=${course.slug}`;

        courseListEl.appendChild(courseCard);
    });
}

loadPage();
