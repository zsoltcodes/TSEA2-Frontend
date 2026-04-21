import { request } from "./api.js";
import { PAGE_TITLE_PREFIX } from "./constants.js";
import { openContentPage, getIconUrlFromCourseContentType } from "./content.js";
import { loadSvg } from "./loadComponents.js";

function decodeCourseContent() {
    const queryParams = new URLSearchParams(window.location.search);

    const courseSlug = decodeURIComponent(queryParams.get("course"));
    const contentSlug = decodeURIComponent(queryParams.get("content"));

    if (!courseSlug) {
        alert("No course specified");
        window.history.back();
    }

    if (!contentSlug) {
        alert("No content specified");
        window.history.back();
    }

    return { courseSlug, contentSlug };
}

const { courseSlug, contentSlug } = decodeCourseContent();

const md = new MiniGFM();
const contentTitleTextEl = document.querySelector(".content-navigator #title");
const pageTextEl = document.querySelector(".content-navigator #page");
const lessonBanner = document.querySelector(".lesson-banner");

const nextBtn = document.querySelector(".btn-next");
const previousBtn = document.querySelector(".btn-previous");

function initialiseNavigationBtn(button, contentSlug) {
    if (contentSlug) {
        button.disabled = false;
        button.onclick = () => openContentPage(courseSlug, contentSlug);
        return;
    }

    button.onclick = null;
    button.disabled = true;
}

function renderQuiz(questions) {
    const container = document.querySelector(".content-container");
    container.innerHTML = "";

    questions.forEach((q, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "quiz-question";

        container.appendChild(wrapper);

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${q.question}`;
        wrapper.appendChild(title);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "quiz-options";

        q.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.textContent = option.text;

            btn.onclick = () => {
                if (option.correct) {
                    btn.style.backgroundColor = "green";
                    btn.style.color = "white";

                    const correctBtn = [...optionsContainer.children].find(
                        (b) => b.dataset.correct === "true",
                    );
                    if (correctBtn) {
                        correctBtn.style.backgroundColor = "green";
                        correctBtn.style.color = "white";
                    }
                } else {
                    btn.style.backgroundColor = "red";
                    btn.style.color = "white";
                }
            };

            if (option.correct) {
                btn.dataset.correct = "true";
            }

            optionsContainer.appendChild(btn);
        });

        wrapper.appendChild(optionsContainer);
        container.appendChild(wrapper);
    });
}

/** Loads the course content provided in the query parameters and populates the page */
async function loadContent() {
    const { course, content } = await request(
        `/courses/${courseSlug}/${contentSlug}`,
    );

    document.title = PAGE_TITLE_PREFIX + content.title;
    const html = md.parse(content.content);

    const contentContainer = document.querySelector(".content-container");
    contentContainer.innerHTML = html;

    await loadSvg(
        "content-icon-container",
        getIconUrlFromCourseContentType(content.type),
    );

    contentTitleTextEl.textContent = content.title;
    pageTextEl.textContent = `${content.position}/${course.contentLength}`;

    if (content.type === "lesson") {
        lessonBanner.style.display = "flex";
    } else if (content.type === "quiz") {
        renderQuiz(content.content);
    }

    initialiseNavigationBtn(previousBtn, content.previousSlug);
    initialiseNavigationBtn(nextBtn, content.nextSlug);
}

loadContent();
