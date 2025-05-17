// Global variables to track state
const miniIconInjected = false

// Listen for clicks on the extension icon in the toolbar
chrome.action.onClicked.addListener(async (tab) => {
  // Don't try to inject into chrome:// pages, extension pages, etc.
  if (!tab.url || !tab.url.startsWith("http")) {
    console.log("Cannot inject content script into this page:", tab.url)
    return
  }

  try {
    // First, check if we can inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // This just checks if we can execute scripts in this tab
        return true
      },
    })

    // Now try to send the message to toggle the mini icon
    chrome.tabs.sendMessage(
      tab.id,
      { action: "toggleMiniIcon" },
      // Add a response callback to handle errors
      (response) => {
        if (chrome.runtime.lastError) {
          // Content script isn't ready, so inject it manually
          injectContentScript(tab.id)
        }
      },
    )
  } catch (error) {
    console.error("Error executing script in tab:", error)
  }
})

// Function to manually inject the content script
async function injectContentScript(tabId) {
  try {
    console.log("Injecting content script into tab:", tabId)

    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content-script.js"],
    })

    // Wait a moment for the script to initialize
    setTimeout(() => {
      // Now try to toggle the mini icon again
      chrome.tabs.sendMessage(tabId, { action: "toggleMiniIcon" }).catch((error) => {
        console.error("Error after injecting content script:", error)
      })
    }, 500)
  } catch (error) {
    console.error("Error injecting content script:", error)
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openVideoOverlay") {
    // Make sure we have a valid tab ID
    if (!sender.tab || !sender.tab.id) {
      sendResponse({ success: false, error: "Invalid tab" })
      return true
    }

    // Send message to content script to open the video overlay
    chrome.tabs.sendMessage(
      sender.tab.id,
      {
        action: "openVideoOverlay",
        videoId: message.videoId,
        videoTitle: message.videoTitle,
        channelTitle: message.channelTitle,
      },
      // Add a response callback to handle errors
      (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          })
        } else {
          sendResponse(response)
        }
      },
    )
    return true // Required for async sendResponse
  }

  // For other messages
  return false
})

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set the user's API key as default
  chrome.storage.sync.set({
    youtubeApiKey: "AIzaSyAUpE5GLrdZXi-OrfutXi_WzWcEbtqigsQ",
  })
  console.log("YouTube API key set to: AIzaSyAUpE5GLrdZXi-OrfutXi_WzWcEbtqigsQ")
})
