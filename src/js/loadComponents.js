/* Variables */

const currentPage = document.body.dataset.page;

/* Load Header / Footer */
async function loadComponent(sectionId, filePath, jsRequired = false) {
    try {
        const section = document.getElementById(sectionId);
        if (!section) { console.warn(`Element with id ${sectionId} is not found.`); return; };

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        
        const html = await response.text();
        section.innerHTML = html;
        
        const cssPath = filePath.replace(/\.html$/, '.css');
        loadCSS(cssPath);

        if (jsRequired) {
            const jsPath = filePath.replace(/\.html$/, '.js');
            loadJS(jsPath);
        }

    }
    catch (err) {
        console.error(err);
    } 
}

/* Load CSS files for Header / Footer */

function loadCSS(filePath) {
    if ([...document.head.querySelectorAll('link')].some(link => link.href.endsWith(filePath))) return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = filePath;
    document.head.appendChild(linkEl);
}

/* Load JS files for Header / Footer */

function loadJS(filePath) {
    if ([...document.querySelectorAll('script')].some(link => link.src.endsWith(filePath))) return;

    const scriptEl = document.createElement('script');
    scriptEl.src = filePath;

    document.body.appendChild(scriptEl);
}

/* Load Features (streaks and code samples) */

/* Streak table */

if (currentPage == 'home') {
    loadComponent('signup-left', '../components/loginStreak/loginStreak.html', true)
}

/* Code Sample Table */

/* Header */

loadComponent('header', '../components/header/header.html');
