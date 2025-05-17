document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const closePopupButton = document.getElementById("close-popup")
  const toggleMiniIconButton = document.getElementById("toggle-mini-icon")
  const apiKeyInput = document.getElementById("api-key-input")
  const saveApiKeyButton = document.getElementById("save-api-key")

  // Set the API key in the input field
  apiKeyInput.value = "AIzaSyAUpE5GLrdZXi-OrfutXi_WzWcEbtqigsQ"

  // Load saved API key
  chrome.storage.sync.get(["youtubeApiKey"], (result) => {
    if (result.youtubeApiKey) {
      apiKeyInput.value = result.youtubeApiKey
    }
  })

  // Close popup button
  closePopupButton.addEventListener("click", () => {
    window.close()
  })

  // Toggle mini icon button
  toggleMiniIconButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleMiniIcon" }).catch((error) => {
          console.error("Error sending message to content script:", error)
        })
      }
    })
  })

  // Save API key button
  saveApiKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim()
    if (apiKey) {
      chrome.storage.sync.set({ youtubeApiKey: apiKey }, () => {
        // Show success message
        saveApiKeyButton.textContent = "Saved!"
        setTimeout(() => {
          saveApiKeyButton.textContent = "Save"
        }, 2000)
      })
    }
  })
})
