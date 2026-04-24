const editDisplayNameBtn = document.getElementById("edit-dsp-name");

let isEditing = false;

editDisplayNameBtn.addEventListener("click", () => {
    const displayName = document.getElementById("username");

    if (!displayName) { throw new Error("Couldn't retrieve display name element"); return; }

    if (!isEditing) {
        isEditing = true;
        displayName.disabled = false;
        displayName.type = "text";

        editDisplayNameBtn.value = "Apply Changes";
    } else if (isEditing) {
        isEditing = false;

        displayName.disabled = true;

        editDisplayNameBtn.value = "Edit display name";

        // save display name
    }
})