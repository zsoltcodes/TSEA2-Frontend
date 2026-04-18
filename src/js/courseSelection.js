async function loadCourses() {
    try {
        const res = await fetch("http://127.0.0.1:8000/api/courses/");
        const courses = await res.json();

        console.log(courses) // Delete
        renderCourses(courses);
    } catch(err) {
        console.error("Failed to load courses: ", err);
    }
}

function renderCourses(courses) {
    const courseTitle = document.querySelector(".course-title");

    const durationHighlight = document.querySelector(".dur-highlight");

    const difficultyHighlight = document.querySelector(".diff-highlight");

    const skillsList = document.querySelector(".skills-list");

    courses.forEach(course => {
        courseTitle.innerHTML = `${course.title}`;
        durationHighlight.innerHTML = `${course.durationHrs}`;
        difficultyHighlight.innerHTML = `${course.difficulty}`;
        
        course.skills.forEach(skill => {
            const span = document.createElement("span");
            span.textContent = skill;
            span.className = "skill";
            skillsList.appendChild(span);
        })
    })
}

loadCourses();