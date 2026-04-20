/** Get icon image url from course content type string */
export function getIconUrlFromCourseContentType(type) {
    switch (type) {
        case "lesson":
            return "/public/book-open-solid-full.svg";
        case "quiz":
            return "/public/question-solid-full.svg";
        case "retrieval":
            return "/public/brain-solid-full.svg";
    }
}

export function openContentPage(courseSlug, contentSlug) {
    window.location.assign(
        `./course-content.html?course=${courseSlug}&content=${contentSlug}`,
    );
}
