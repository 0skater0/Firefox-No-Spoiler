document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

/* function saveOptions(event) {
    event.preventDefault();
    const option1Value = document.getElementById("option1").checked;
    const option2Value = document.getElementById("option2").value;

    browser.storage.local.set({
        option1: option1Value,
        option2: option2Value,
    });
}

function restoreOptions() {
    browser.storage.local.get(["option1", "option2"]).then((result) => {
        document.getElementById("option1").checked = result.option1 || false;
        document.getElementById("option2").value = result.option2 || "";
    });
}
 */
