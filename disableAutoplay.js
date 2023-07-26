if (!window.cancelInterval) {
  window.cancelInterval = setInterval(
    () => {
      button = document.getElementsByClassName('ytp-upnext-cancel-button')[0]
      upnext = document.getElementsByClassName('ytp-upnext')[0]
      isUpNextHidden = upnext.classList.contains('ytp-upnext-autoplay-paused')
      if (button && !isUpNextHidden) { button.click() }
    },
    4000,
  )
}
