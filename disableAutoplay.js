// Add an event listener to interrupt autoplay when the video ends
const videoElement = document.querySelector("video");
if (videoElement) {
    videoElement.addEventListener("ended", function () {
        handleVideoEnded();
    });
}

// Function to check if the addon is active and stopping the autoplay
function handleVideoEnded() {
    // Check if the addon is active by the user
    browser.storage.local.get("YouTubeNoSpoilersActive").then((result) => {
        const isSpoilersActive = result.YouTubeNoSpoilersActive;

        if (isSpoilersActive) {
            // Look for the cancel button
            const cancelAutoplayButton = document.querySelector(
                ".ytp-autonav-endscreen-upnext-cancel-button"
            );

            //Clicking the cancle button IF it exists to interrupt autoplay
            if (cancelAutoplayButton) {
                cancelAutoplayButton.click();
            } else {
                console.log("Could not find autoplay button!");
            }
        }
    });
}
