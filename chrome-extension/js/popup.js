// Popup script for Brain Rot Blocker

// Function to update stats in the popup
function updateStats(forceSync = false) {
  // If forceSync is true, synchronize with the API first
  if (forceSync) {
    chrome.runtime.sendMessage({ type: 'SYNC_COINS' }, () => {
      // After syncing, get the updated stats
      fetchAndDisplayStats();
    });
  } else {
    // Otherwise, just display current stats
    fetchAndDisplayStats();
  }
}

// Function to fetch stats from storage and display them
function fetchAndDisplayStats() {
  chrome.storage.local.get(
    ['brainCoins', 'youtubeTimeToday', 'coinsSpentToday', 'blockedTime'],
    (result) => {
      const brainCoinsElement = document.getElementById('brain-coins');
      const youtubeTimeElement = document.getElementById('youtube-time');
      const coinsSpentElement = document.getElementById('coins-spent');
      const blockedTimeElement = document.getElementById('blocked-time');
      const statusElement = document.getElementById('sync-status');
      
      if (brainCoinsElement) {
        brainCoinsElement.textContent = result.brainCoins || 0;
      }
      
      if (youtubeTimeElement) {
        youtubeTimeElement.textContent = `${result.youtubeTimeToday || 0} min`;
      }
      
      if (coinsSpentElement) {
        coinsSpentElement.textContent = result.coinsSpentToday || 0;
      }
      
      if (blockedTimeElement) {
        blockedTimeElement.textContent = `${result.blockedTime || 0} min`;
      }
      
      // Update the sync status indicator
      if (statusElement) {
        statusElement.textContent = '🔄 Synced with web app';
        statusElement.classList.add('synced');
        
        // Hide the synced message after 3 seconds
        setTimeout(() => {
          statusElement.textContent = '';
          statusElement.classList.remove('synced');
        }, 3000);
      }
    }
  );
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Force API sync and update stats when the popup is opened
  updateStats(true);
  
  // Add button click event listeners
  const addCoinsButton = document.getElementById('add-coins');
  if (addCoinsButton) {
    addCoinsButton.addEventListener('click', () => {
      chrome.runtime.sendMessage(
        { type: 'ADD_COINS', amount: 500 },
        (response) => {
          updateStats(true); // Force sync after adding coins
          // Flash the brain coins display
          const brainCoinsElement = document.getElementById('brain-coins');
          if (brainCoinsElement) {
            brainCoinsElement.style.color = '#00ff00';
            setTimeout(() => {
              brainCoinsElement.style.color = '#ff5555';
            }, 1000);
          }
        }
      );
    });
  }
  
  const resetStatsButton = document.getElementById('reset-stats');
  if (resetStatsButton) {
    resetStatsButton.addEventListener('click', () => {
      chrome.runtime.sendMessage(
        { type: 'RESET_STATS' },
        (response) => {
          updateStats(true); // Force sync after resetting stats
        }
      );
    });
  }
  
  // Add sync button functionality
  const syncButton = document.getElementById('sync-button');
  if (syncButton) {
    syncButton.addEventListener('click', () => {
      updateStats(true);
    });
  }
});