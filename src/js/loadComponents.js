async function loadComponent(sectionId, filePath) {
    try {
        const section = document.getElementById(sectionId);
        if (!section) { console.warn(`Element with id ${sectionId} is not found.`); return; };

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        
        const html = await response.text();
        section.innerHTML = html;
        
        const cssPath = filePath.replace(/\.html$/, '.css');
        loadCSS(cssPath);
    }
    catch (err) {
        console.error(err);
    } 
}

function loadCSS(filePath) {
    if ([...document.head.querySelectorAll('link')].some(link => link.href.endsWith(filePath))) return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = filePath;
    document.head.appendChild(linkEl);
}

loadComponent('header', '../components/header/header.html');
