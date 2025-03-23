// Background script for Brain Rot Blocker

// API endpoints
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_GET_COINS = `${API_BASE_URL}/get_coins`;
const API_ADD_COINS = `${API_BASE_URL}/add_coins`;
const API_REMOVE_COINS = `${API_BASE_URL}/remove_coins`;

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['youtubeTimeToday', 'coinsSpentToday', 'blockedTime'], (result) => {
    // We'll initialize the youtubeTimeToday, coinsSpentToday, and blockedTime
    // but fetch brainCoins from the API
    chrome.storage.local.set({
      youtubeTimeToday: result.youtubeTimeToday || 0,
      coinsSpentToday: result.coinsSpentToday || 0,
      blockedTime: result.blockedTime || 0,
      lastDay: new Date().toDateString()
    });
    
    // Fetch initial coin balance from API
    fetchCoinsFromAPI();
  });
  
  // Reset daily stats if it's a new day
  checkAndResetDailyStats();
});

// Check if it's a new day and reset daily stats
function checkAndResetDailyStats() {
  chrome.storage.local.get(['lastDay'], (result) => {
    const today = new Date().toDateString();
    if (result.lastDay !== today) {
      chrome.storage.local.set({
        youtubeTimeToday: 0,
        coinsSpentToday: 0,
        lastDay: today
      });
    }
  });
}

// Function to fetch coin balance from API
function fetchCoinsFromAPI() {
  fetch(API_GET_COINS)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      chrome.storage.local.set({ brainCoins: data.brain_coins });
      console.log('Synced coin balance from API:', data.brain_coins);
    })
    .catch(error => {
      console.error('Failed to fetch coins from API:', error);
      // Fallback to local storage if API fails
      chrome.storage.local.get(['brainCoins'], (result) => {
        if (result.brainCoins === undefined) {
          chrome.storage.local.set({ brainCoins: 1000 }); // Default fallback
        }
      });
    });
}

// Function to spend coins via API
function spendCoinsViaAPI(amount) {
  return fetch(API_REMOVE_COINS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amount })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // After successful API call, update local storage with the new balance
      fetchCoinsFromAPI();
      return data;
    });
}

// Function to add coins via API
function addCoinsViaAPI(amount) {
  return fetch(API_ADD_COINS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amount })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // After successful API call, update local storage with the new balance
      fetchCoinsFromAPI();
      return data;
    });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COINS') {
    // First try to get coins from API
    fetch(API_GET_COINS)
      .then(response => response.json())
      .then(data => {
        chrome.storage.local.set({ brainCoins: data.brain_coins });
        sendResponse({ brainCoins: data.brain_coins });
      })
      .catch(error => {
        // If API fails, fall back to local storage
        console.error('Failed to fetch coins from API:', error);
        chrome.storage.local.get(['brainCoins'], (result) => {
          sendResponse({ brainCoins: result.brainCoins || 0 });
        });
      });
    return true; // Indicate async response
  }
  
  if (message.type === 'SPEND_COINS') {
    const coinsToSpend = message.amount || 0;
    
    // First get the current balance from API
    fetch(API_GET_COINS)
      .then(response => response.json())
      .then(data => {
        const currentCoins = data.brain_coins;
        
        // Only spend coins if we have enough
        if (currentCoins >= coinsToSpend) {
          // Try to spend via API first
          spendCoinsViaAPI(coinsToSpend)
            .then(() => {
              // Update local stats
              chrome.storage.local.get(['youtubeTimeToday', 'coinsSpentToday'], (result) => {
                let youtubeTime = result.youtubeTimeToday || 0;
                let coinsSpent = result.coinsSpentToday || 0;
                
                youtubeTime += 1; // 1 minute increment
                coinsSpent += coinsToSpend;
                
                chrome.storage.local.set({
                  youtubeTimeToday: youtubeTime,
                  coinsSpentToday: coinsSpent
                });
                
                // Get updated balance
                fetchCoinsFromAPI();
                
                sendResponse({ 
                  success: true, 
                  brainCoins: currentCoins - coinsToSpend,
                  message: `Spent ${coinsToSpend} coins. ${currentCoins - coinsToSpend} remaining.`
                });
              });
            })
            .catch(error => {
              console.error('Failed to spend coins via API:', error);
              sendResponse({ 
                success: false, 
                brainCoins: currentCoins,
                message: `Failed to spend coins: ${error.message}`
              });
            });
        } else {
          // Not enough coins
          chrome.storage.local.get(['blockedTime'], (result) => {
            let blocked = result.blockedTime || 0;
            blocked += 1; // 1 minute blocked
            chrome.storage.local.set({ blockedTime: blocked });
            
            sendResponse({ 
              success: false, 
              brainCoins: currentCoins,
              message: `Not enough coins. Need ${coinsToSpend}, but only have ${currentCoins}.`
            });
          });
        }
      })
      .catch(error => {
        // If API fails, fall back to local storage
        console.error('Failed to fetch coins from API:', error);
        chrome.storage.local.get(['brainCoins', 'youtubeTimeToday', 'coinsSpentToday', 'blockedTime'], (result) => {
          let currentCoins = result.brainCoins || 0;
          let youtubeTime = result.youtubeTimeToday || 0;
          let coinsSpent = result.coinsSpentToday || 0;
          let blocked = result.blockedTime || 0;
          
          // Only spend coins if we have enough
          if (currentCoins >= coinsToSpend) {
            currentCoins -= coinsToSpend;
            youtubeTime += 1; // 1 minute increment
            coinsSpent += coinsToSpend;
            
            chrome.storage.local.set({
              brainCoins: currentCoins,
              youtubeTimeToday: youtubeTime,
              coinsSpentToday: coinsSpent
            });
            
            sendResponse({ 
              success: true, 
              brainCoins: currentCoins,
              message: `Spent ${coinsToSpend} coins. ${currentCoins} remaining. (Offline mode)`
            });
          } else {
            blocked += 1; // 1 minute blocked
            chrome.storage.local.set({
              blockedTime: blocked
            });
            
            sendResponse({ 
              success: false, 
              brainCoins: currentCoins,
              message: `Not enough coins. Need ${coinsToSpend}, but only have ${currentCoins}. (Offline mode)`
            });
          }
        });
      });
    return true; // Indicate async response
  }
  
  if (message.type === 'ADD_COINS') {
    const coinsToAdd = message.amount || 0;
    
    // Try to add coins via API
    addCoinsViaAPI(coinsToAdd)
      .then(data => {
        // After success, fetch the updated balance
        fetchCoinsFromAPI();
        sendResponse({ 
          success: true,
          message: `Added ${coinsToAdd} coins via API.`
        });
      })
      .catch(error => {
        // If API fails, fall back to local storage
        console.error('Failed to add coins via API:', error);
        chrome.storage.local.get(['brainCoins'], (result) => {
          const newTotal = (result.brainCoins || 0) + coinsToAdd;
          chrome.storage.local.set({ brainCoins: newTotal });
          sendResponse({ 
            success: true,
            brainCoins: newTotal,
            message: `Added ${coinsToAdd} coins. New total: ${newTotal}. (Offline mode)`
          });
        });
      });
    return true; // Indicate async response
  }
  
  if (message.type === 'RESET_STATS') {
    chrome.storage.local.set({
      youtubeTimeToday: 0,
      coinsSpentToday: 0,
      blockedTime: 0
    });
    sendResponse({ success: true, message: 'Stats reset successfully.' });
    return true;
  }
  
  if (message.type === 'SYNC_COINS') {
    fetchCoinsFromAPI();
    sendResponse({ success: true, message: 'Triggered coin sync from API.' });
    return true;
  }
});

// Listen for navigation to YouTube domains
chrome.webNavigation.onCompleted.addListener((details) => {
  // Only handle main frame
  if (details.frameId === 0) {
    // Reset daily stats if it's a new day
    checkAndResetDailyStats();
    
    // Send a message to the content script to check for YouTube 
    // This applies to ALL YouTube pages, not just video pages
    chrome.tabs.sendMessage(details.tabId, { 
      type: 'CHECK_YOUTUBE',
      url: details.url
    });
  }
}, { url: [{ hostContains: 'youtube.com' }] });

// Also listen for tab updates to catch page changes within YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    chrome.tabs.sendMessage(tabId, { 
      type: 'CHECK_YOUTUBE',
      url: tab.url
    });
  }
});