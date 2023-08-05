var checkvar = true;
document.addEventListener('DOMNodeInserted', check);

function check() {
    var exists = document.getElementsByClassName("ytp-play-button");
    if (exists.length > 0 && null !== exists[0].offsetParent && checkvar === true) {
        checkvar = false;
        main();
    }
}

async function isActive() {
    let data = await browser.storage.local.get("YouTubeNoSpoilersActive");
    return data.hasOwnProperty("YouTubeNoSpoilersActive") ? data.YouTubeNoSpoilersActive : false;
}

async function getSettings() {
    try {
        const data = await browser.storage.sync.get([
            "showVideoTime",
            "showProgressBar",
            "showComments",
            "showDescription",
            "showRecommendations",
            "showChat",
            "showEndcard",
            "enableAutoplay",
            "enableSkipButtons",  // Add this line
        ]);

        const settings = {
            showVideoTime: data.showVideoTime || false,
            showProgressBar: data.showProgressBar || false,
            showComments: data.showComments || false,
            showDescription: data.showDescription || false,
            showRecommendations: data.showRecommendations || false,
            showChat: data.showChat || false,
            showEndcard: data.showEndcard || false,
            enableAutoplay: data.enableAutoplay || false,
            enableSkipButtons: data.enableSkipButtons || false,  // Add this line
        };

        return settings;
    } catch (error) {
        console.error("NoSpoiler: Error retrieving settings at ", error);
        return {};
    }
}

function removeSkipButtons() {
    var skipControls = document.getElementsByClassName("noSpoilerSkipControls")[0];
    if (skipControls) {
        skipControls.remove();
    }
}

browser.storage.local.onChanged.addListener(function(changes) {
    if ('YouTubeNoSpoilersActive' in changes) {
        var active = changes.YouTubeNoSpoilersActive.newValue;
        if (active) {
            main();
        } else {
            removeSkipButtons();
        }
    }
});

async function main() {
    var active = await isActive();
    var settings = await getSettings();
    if (active && settings.enableSkipButtons) {
        var playBtn = document.getElementsByClassName("ytp-play-button")[0];
        var skipControls = document.createElement("div");
        skipControls.setAttribute("class", "noSpoilerSkipControls");

        // Create 10 mins skip buttons
        var skipBack10 = createSkipButton('rewind10min.png', 'yt_back_10', skipBack10Func);
        var skipForward10 = createSkipButton('forward10min.png', 'yt_forward_10', skipForward10Func);

        // Create 5 mins skip buttons
        var skipBack5 = createSkipButton('rewind5min.png', 'yt_back_5', skipBack5Func);
        var skipForward5 = createSkipButton('forward5min.png', 'yt_forward_5', skipForward5Func);

        // Append the buttons to controls
        skipControls.appendChild(skipBack10);
        skipControls.appendChild(skipBack5);
        skipControls.appendChild(skipForward5);
        skipControls.appendChild(skipForward10);

        insertAfter(playBtn, skipControls);
        document.removeEventListener('DOMNodeInserted', check);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    var active = await isActive();
    if (active) {
        main();
    } else {
        removeSkipButtons();
    }
});

// Listen for the SETTINGS_SAVED event
window.addEventListener("message", async function(event) {
    if (event.data.type === "SETTINGS_SAVED") {
        var settings = await getSettings();
        var active = await isActive();
        if (settings.enableSkipButtons && active) {
            main();
        } else {
            removeSkipButtons();
        }
    }
});

function createSkipButton(imgSrc, id, skipFunc) {
    var skipDiv = document.createElement("div");
    var img = document.createElement("img");

    img.setAttribute("src", browser.runtime.getURL(`icons/${imgSrc}`));  // Update this line
    img.setAttribute("class", "control");
    img.setAttribute("id", id);

    skipDiv.appendChild(img);
    skipDiv.addEventListener("click", skipFunc);

    return skipDiv;
}

// Skip 10 mins back
function skipBack10Func() {
    var video = getVideo();
    if (video) {
        if (video.currentTime > 600) {
            video.currentTime -= 600;
        } else {
            video.currentTime = 0;
        }
    }
}

// Skip 10 mins forward
function skipForward10Func() {
    var video = getVideo();
    if (video) {
        video.currentTime += 600;
    }
}

// Skip 5 mins back
function skipBack5Func() {
    var video = getVideo();
    if (video) {
        if (video.currentTime > 300) {
            video.currentTime -= 300;
        } else {
            video.currentTime = 0;
        }
    }
}

// Skip 5 mins forward
function skipForward5Func() {
    var video = getVideo();
    if (video) {
        video.currentTime += 300;
    }
}

function getVideo() {
    return document.getElementsByClassName("html5-main-video")[0];
}

function insertAfter(referenceNode, el) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
