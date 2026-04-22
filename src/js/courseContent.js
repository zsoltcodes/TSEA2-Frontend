import { request } from "./api.js";
import { capitalise } from "./strings.js";
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

const nextBtn = document.querySelector(".btn-next");
const previousBtn = document.querySelector(".btn-previous");

function calculateCompletionProgress(questionsLength, completedQuestions) {
    const completionPercentage = Math.floor(
        (completedQuestions / questionsLength) * 100,
    );

    const remainingQuestions = questionsLength - completedQuestions;

    return { completionPercentage, remainingQuestions };
}

function renderProgress(questionsLength, completedQuestions) {
    const { completionPercentage, remainingQuestions } =
        calculateCompletionProgress(questionsLength, completedQuestions);

    const questionsAnsweredTextEl = document.getElementById(
        "questions-answered-text",
    );
    const questionsRemainingTextEl = document.getElementById(
        "questions-remaining-text",
    );

    questionsAnsweredTextEl.textContent = `${completionPercentage}% Completed`;
    questionsRemainingTextEl.textContent = `${questionsLength - completedQuestions} Question${remainingQuestions > 1 ? "s" : ""} Remaining`;

    const progressEl = document.querySelector(".progress-bar-progress");
    progressEl.style.width = `${completionPercentage}%`;
}

function quizCorrectOption(optionsContainer, btn) {
    btn.style.backgroundColor = "green";
    btn.style.color = "white";

    const correctBtn = [...optionsContainer.children].find(
        (b) => b.dataset.correct === "true",
    );

    if (correctBtn) {
        correctBtn.style.backgroundColor = "green";
        correctBtn.style.color = "white";
    }
}

function renderQuiz(questions) {
    const quizContainer = document.querySelector(".quiz-container");
    let completedQuestions = 0;
    renderProgress(questions.length, completedQuestions);

    questions.forEach((q, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "quiz-question";

        quizContainer.appendChild(wrapper);

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${q.question}`;
        wrapper.appendChild(title);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "quiz-options";

        let isQuestionCompleted = false;

        q.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.textContent = option.text;

            btn.onclick = () => {
                if (isQuestionCompleted) return;

                if (!option.correct) {
                    btn.style.backgroundColor = "red";
                    btn.style.color = "white";
                    return;
                }

                isQuestionCompleted = true;

                quizCorrectOption(optionsContainer, btn);
                renderProgress(questions.length, ++completedQuestions);
            };

            if (option.correct) {
                btn.dataset.correct = "true";
            }

            optionsContainer.appendChild(btn);
        });

        wrapper.appendChild(optionsContainer);
        quizContainer.appendChild(wrapper);
    });
}

function initialiseNavigationBtn(button, contentSlug) {
    if (contentSlug) {
        button.disabled = false;
        button.onclick = () => openContentPage(courseSlug, contentSlug);
        return;
    }

    button.onclick = null;
    button.disabled = true;
}

async function renderLesson({ content }) {
    const html = md.parse(content);
    const contentContainer = document.querySelector(".content-container");
    contentContainer.innerHTML = html;
}

/** Loads the course content provided in the query parameters and populates the page */
async function loadContent() {
    const { course, content } = await request(
        `/courses/${courseSlug}/${contentSlug}`,
    );

    document.title = PAGE_TITLE_PREFIX + content.title;

    const contentIconUrl = getIconUrlFromCourseContentType(content.type);
    await loadSvg("content-icon-container", contentIconUrl);
    await loadSvg("navigation-content-icon-container", contentIconUrl);

    contentTitleTextEl.textContent = content.title;
    pageTextEl.textContent = `${content.position}/${course.contentLength}`;

    const quizBannerText = document.getElementById("content-banner-text");
    quizBannerText.textContent = capitalise(content.type);

    switch (content.type) {
        case "lesson":
            renderLesson(content);
            break;

        case "quiz":
            renderQuiz(content.content);
            break;

        default:
            break;
    }

    initialiseNavigationBtn(previousBtn, content.previousSlug);
    initialiseNavigationBtn(nextBtn, content.nextSlug);
}

loadContent();
