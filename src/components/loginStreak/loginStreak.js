function generateDots(amount, parentElId) {
    const span = document.createElement('span');
    span.className = "dot";
    
    const rows = document.querySelectorAll('.row');

    const parentEl = document.getElementById(parentElId)
    if (!parentEl) {return console.error(`Element with the id ${parentElId} not found.`)}

    let day = 1;
    
    for (let week = 0; week < rows.length; week++) {
        for (let i = 0; i < 7; i++) {
            if (day >= amount) break;

            let spanClone = span.cloneNode(false);
            rows[week].appendChild(spanClone);

            day++;
        }
    }
}

generateDots(31, 'bottom-table');