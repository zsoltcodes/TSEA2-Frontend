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

function showProgressBar() {
    const progressBar = document.querySelector(".progress-bar-container");
    progressBar.style.display = "block";
}

function hideProgressBar() {
    const progressBar = document.querySelector(".progress-bar-container");
    progressBar.style.display = "none";
}

function renderProgressBar(questionsLength, completedQuestions) {
    const { completionPercentage, remainingQuestions } =
        calculateCompletionProgress(questionsLength, completedQuestions);

    const questionsAnsweredTextEl = document.getElementById(
        "questions-answered-text",
    );
    const questionsRemainingTextEl = document.getElementById(
        "questions-remaining-text",
    );

    questionsAnsweredTextEl.textContent = `${completionPercentage}% Completed`;
    questionsRemainingTextEl.textContent = `${questionsLength - completedQuestions} Question${remainingQuestions != 1 ? "s" : ""} Remaining`;

    const progressEl = document.querySelector(".progress-bar-progress");
    progressEl.style.width = `${completionPercentage}%`;

    if (completedQuestions === questionsLength) {
        progressEl.style.color = "white";
        progressEl.style.backgroundColor = "green";
    }
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

function computeTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;

    return ctx.measureText(text).width;
}

function renderRetrievalInput(question, container) {
    const { answers, retrieval } = question;

    let answerIdx = 0;

    const expectedInputs = [];

    const parts = retrieval.split("%blank%");
    parts.forEach((part, index) => {
        if (part) {
            const em = document.createElement("em");
            em.innerHTML = part.replace(" ", "&nbsp;");
            container.appendChild(em);
        }

        if (index < parts.length - 1) {
            const input = document.createElement("input");

            const expectedAnswer = answers[answerIdx++];

            input.style.width =
                computeTextWidth(expectedAnswer, "30px Inter") + "px";

            container.appendChild(input);

            expectedInputs.push({
                inputElement: input,
                expectedAnswer,

                isCorrect: () => {
                    return (
                        input.value.trim().toLowerCase() ==
                        expectedAnswer.trim().toLowerCase()
                    );
                },
            });
        }
    });

    return expectedInputs;
}

function renderRetrieval(questions) {
    const retrievalContainer = document.querySelector(".questions-container");
    let completedQuestions = 0;

    showProgressBar();
    renderProgressBar(questions.length, completedQuestions);

    questions.forEach((q, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "question";

        retrievalContainer.appendChild(wrapper);

        const title = document.createElement("h3");
        title.textContent = `${idx + 1}. ${q.question}`;
        wrapper.appendChild(title);

        const retrievalInputContainer = document.createElement("div");
        const expectedInputs = renderRetrievalInput(q, retrievalInputContainer);

        const checkBtn = document.createElement("button");
        checkBtn.textContent = "Check";

        const retrievalStatusContainer = document.createElement("div");
        retrievalStatusContainer.className = "retrieval-status-container";
        retrievalStatusContainer.style.display = "none";

        const retrievalStatusIconImg = document.createElement("img");
        retrievalStatusIconImg.style.width = "60px";

        const retrievalStatusText = document.createElement("p");

        retrievalStatusContainer.appendChild(retrievalStatusIconImg);
        retrievalStatusContainer.appendChild(retrievalStatusText);

        checkBtn.addEventListener("click", () => {
            let allCorrect = true;

            expectedInputs.forEach((expectedInput) => {
                const isCorrect = expectedInput.isCorrect();
                const { inputElement } = expectedInput;

                if (!isCorrect) {
                    inputElement.style.backgroundColor = "lightcoral";
                    allCorrect = false;
                    return;
                }

                inputElement.style.backgroundColor = "lightgreen";
            });

            retrievalStatusContainer.style.display = "flex";

            if (!allCorrect) {
                retrievalStatusIconImg.src =
                    "/public/circle-xmark-solid-full.svg";
                retrievalStatusText.textContent = "Incorrect";

                return;
            }

            retrievalStatusIconImg.src = "/public/circle-check-solid-full.svg";
            retrievalStatusText.textContent = "Correct!";

            checkBtn.disabled = true;
            expectedInputs.forEach(
                ({ inputElement }) => (inputElement.disabled = true),
            );

            renderProgressBar(questions.length, ++completedQuestions);
        });

        wrapper.appendChild(retrievalInputContainer);
        wrapper.appendChild(checkBtn);
        wrapper.appendChild(retrievalStatusContainer);

        retrievalContainer.appendChild(wrapper);
    });
}

function renderQuiz(questions) {
    const quizContainer = document.querySelector(".questions-container");
    let completedQuestions = 0;

    showProgressBar();
    renderProgressBar(questions.length, completedQuestions);

    questions.forEach((q, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "question";

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
            btn.className = "quiz-btn";

            btn.onclick = () => {
                if (isQuestionCompleted) return;

                if (!option.correct) {
                    btn.style.backgroundColor = "red";
                    btn.style.color = "white";
                    return;
                }

                isQuestionCompleted = true;

                quizCorrectOption(optionsContainer, btn);
                renderProgressBar(questions.length, ++completedQuestions);
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

        case "retrieval":
            renderRetrieval(content.content);
            break;

        default:
            break;
    }

    initialiseNavigationBtn(previousBtn, content.previousSlug);
    initialiseNavigationBtn(nextBtn, content.nextSlug);
}

loadContent();
