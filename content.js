let isCloseTabEnabled = false;
let isUIHidden = false;
let isDragging = false;
let dragOffsetX, dragOffsetY;

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) {
    return "Unavailable";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
}

function getVideoDuration() {
  const videoElement = document.querySelector("video");
  return videoElement ? videoElement.duration : null;
}

function getCurrentVideoTime() {
  const videoElement = document.querySelector("video");
  return videoElement ? videoElement.currentTime : null;
}

function playIfNotRunning() {
  const videoElement = document.querySelector("video");
  if (videoElement && videoElement.paused) {
    videoElement.play();
    videoElement.ful;
  }
}

function createMaterialUI(duration) {
  const uiContainer = document.createElement("div");
  uiContainer.id = "dopo-youtube-helper";
  uiContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 280px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    font-family: 'Roboto', sans-serif;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    background-color: #3f51b5;
    color: white;
    padding: 16px;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement("span");
  title.textContent = "Dopo Youtube Helper";

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "−";
  toggleButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
  `;

  header.appendChild(title);
  header.appendChild(toggleButton);

  const content = document.createElement("div");
  content.style.cssText = `
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Add event listeners for drag functionality
  header.addEventListener("mousedown", (e) => {
    if (isUIHidden) {
      isDragging = true;
      dragOffsetX = uiContainer.offsetLeft - e.clientX;
      dragOffsetY = uiContainer.offsetTop - e.clientY;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      uiContainer.style.top = `${e.clientY + dragOffsetY}px`;
      uiContainer.style.left = `${e.clientX + dragOffsetX}px`;
      chrome.storage.sync.set({
        uiPosition: {
          top: uiContainer.style.top,
          left: uiContainer.style.left,
        },
      });
    }
  });

  function createInfoRow(label, initialValue, valueColor) {
    const row = document.createElement("div");
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f5f5f5;
      padding: 8px 12px;
      border-radius: 6px;
    `;
    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    labelSpan.style.color = "#666666";
    const valueSpan = document.createElement("span");
    valueSpan.textContent = initialValue;
    valueSpan.style.cssText = `
      color: ${valueColor};
      font-weight: 500;
      font-size: 18px;
    `;
    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    return { row, valueSpan };
  }

  const { row: durationRow, valueSpan: durationValue } = createInfoRow(
    "Video Length",
    duration ? formatTime(duration) : "Unavailable 😢",
    "#f44336"
  );
  const { row: currentTimeRow, valueSpan: currentTimeValue } = createInfoRow(
    "Current Time",
    "Loading...",
    "#4CAF50"
  );

  content.appendChild(durationRow);
  content.appendChild(currentTimeRow);

  // Add progress bar
  const progressBarContainer = document.createElement("div");
  progressBarContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 12px;
  `;

  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    width: 0%;
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease;
  `;

  progressBarContainer.appendChild(progressBar);
  content.appendChild(progressBarContainer);

  function createButton(text, bgColor, hoverColor, activeColor) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText = `
      background-color: ${bgColor};
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: auto;
      margin-top: 8px;
      position: relative;
      overflow: hidden;
    `;

    let isActive = false;

    button.addEventListener("mouseover", () => {
      if (!isActive) {
        button.style.backgroundColor = hoverColor;
      }
      button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    });

    button.addEventListener("mouseout", () => {
      if (!isActive) {
        button.style.backgroundColor = bgColor;
      }
      button.style.boxShadow = "none";
    });

    button.setActive = (active) => {
      isActive = active;
      button.style.backgroundColor = active ? activeColor : bgColor;
    };

    return button;
  }

  const closeTabToggle = createButton(
    "Close Tab On Video Ends",
    "#2196F3",
    "#1E88E5",
    "#f44336"
  );

  // Add a visual indicator for the toggle state
  const toggleIndicator = document.createElement("div");
  toggleIndicator.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  `;
  closeTabToggle.appendChild(toggleIndicator);

  chrome.storage.sync.get(["isCloseTabEnabled", "isUIHidden"], (result) => {
    isCloseTabEnabled = result.isCloseTabEnabled || false;
    isUIHidden = result.isUIHidden || false;
    updateCloseTabToggleState();
    updateUIVisibility();
  });

  closeTabToggle.addEventListener("click", () => {
    isCloseTabEnabled = !isCloseTabEnabled;
    chrome.storage.sync.set({ isCloseTabEnabled: isCloseTabEnabled });
    updateCloseTabToggleState();
  });

  content.appendChild(closeTabToggle);

  uiContainer.appendChild(header);
  uiContainer.appendChild(content);

  function toggleUI() {
    isUIHidden = !isUIHidden;
    chrome.storage.sync.set({ isUIHidden: isUIHidden });
    updateUIVisibility();
  }

  function updateUIVisibility() {
    if (isUIHidden) {
      content.style.display = "none";
      uiContainer.style.width = "auto";
      uiContainer.style.height = "auto";
      toggleButton.textContent = "+";
      title.textContent = "Dopo";
    } else {
      content.style.display = "flex";
      uiContainer.style.width = "280px";
      uiContainer.style.height = "auto";
      toggleButton.textContent = "−";
      title.textContent = "Dopo Youtube Helper";
    }
  }

  toggleButton.addEventListener("click", toggleUI);

  // Load saved position from storage
  chrome.storage.sync.get(["uiPosition"], (result) => {
    if (result.uiPosition) {
      uiContainer.style.top = result.uiPosition.top;
      uiContainer.style.left = result.uiPosition.left;
    }
  });

  function updateCurrentTime() {
    const currentTime = getCurrentVideoTime();
    const duration = getVideoDuration();

    if (currentTime != null && duration != null) {
      currentTimeValue.textContent = formatTime(currentTime);
      durationValue.textContent = formatTime(duration);

      // Update progress bar
      const progress = (currentTime / duration) * 100;
      progressBar.style.width = `${progress}%`;

      if (isCloseTabEnabled && Math.abs(duration - currentTime) < 1) {
        chrome.runtime.sendMessage({ action: "closeTab" });
      }
    } else {
      currentTimeValue.textContent = "Unavailable";
      durationValue.textContent = "Unavailable";
    }
  }

  function updateCloseTabToggleState() {
    if (isCloseTabEnabled) {
      closeTabToggle.setActive(true);
      closeTabToggle.textContent = "Cancel Close on End";
      toggleIndicator.style.transform = "translateX(0)";
    } else {
      closeTabToggle.setActive(false);
      closeTabToggle.textContent = "Close Tab On Video Ends";
      toggleIndicator.style.transform = "translateX(-100%)";
    }
  }

  setInterval(updateCurrentTime, 1000);

  return uiContainer;
}

function displayUI() {
  if (!document.querySelector("#dopo-youtube-helper")) {
    const duration = getVideoDuration();
    const ui = createMaterialUI(duration);
    document.body.appendChild(ui);
  }
}

function checkForVideoPlayer() {
  const videoElement = document.querySelector("video");
  const moviePlayer = document.querySelector("#movie_player");

  if (videoElement && moviePlayer) {
    if (videoElement.readyState >= 2) {
      // HAVE_CURRENT_DATA or higher
      displayUI();
    } else {
      videoElement.addEventListener("loadedmetadata", displayUI, {
        once: true,
      });
    }
  } else {
    setTimeout(checkForVideoPlayer, 1000);
  }
}

// Call checkForVideoPlayer directly instead of waiting for window load
checkForVideoPlayer();

// Add a mutation observer to handle dynamic page changes
const observer = new MutationObserver((mutations) => {
  if (!document.querySelector("#dopo-youtube-helper")) {
    checkForVideoPlayer();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.action === "showSwitchedPrompt") {
    console.log("showSwitchedPrompt triggered");
    playIfNotRunning();
  }
});
