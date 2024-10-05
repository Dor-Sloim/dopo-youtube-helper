let lastClosedTabId = null;

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log("Tab closed:", tabId);
  lastClosedTabId = tabId;
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab activated:", activeInfo.tabId);

  if (lastClosedTabId !== null) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url.includes("youtube.com/watch")) {
        console.log("includes youtube");

        try {
          chrome.tabs.sendMessage(activeInfo.tabId, {
            action: "showSwitchedPrompt",
          });
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    });
    lastClosedTabId = null;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeTab") {
    chrome.tabs.remove(sender.tab.id);
  }
});
