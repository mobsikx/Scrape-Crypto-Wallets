importScripts('ExtPay.js');

const extpay = ExtPay('crypto-wallet-scrapper---btc');
extpay.startBackground();

let scrapingIntervalId = null;

chrome.runtime.onInstalled.addListener(() => {
  extpay.getUser().then(user => {
    if (user.paid) {
      startScraping();
    }
  }).catch(error => {
    console.error('Error fetching user:', error);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.wallets && message.domain) {
    chrome.storage.local.get(['walletData'], function (result) {
      let walletData = result.walletData || {};
      let newWallets = false;

      message.wallets.forEach(wallet => {
        if (!walletData[wallet]) {
          walletData[wallet] = { count: 1, domains: [message.domain] };
          newWallets = true;
        } else if (!walletData[wallet].domains.includes(message.domain)) {
          walletData[wallet].domains.push(message.domain);
          walletData[wallet].count++;
          newWallets = true;
        }
      });

      chrome.storage.local.set({ walletData }, function () {
        if (newWallets) {
          updateBadge();
        }
      });
    });
  }

  if (message.action === 'toggleScraping') {
    chrome.storage.local.set({ scrapingEnabled: message.enabled }, function() {
      if (message.enabled) {
        startScraping();
      } else {
        stopScraping();
      }
    });
  }
});

function startScraping() {
  injectScrapingScript();
  if (scrapingIntervalId === null) {
    scrapingIntervalId = setInterval(injectScrapingScript, 30000); // 30 seconds
  }
  chrome.alarms.create('scrapeWallets', { periodInMinutes: 0.5 });
}

function stopScraping() {
  if (scrapingIntervalId !== null) {
    clearInterval(scrapingIntervalId);
    scrapingIntervalId = null;
  }
  chrome.alarms.clear('scrapeWallets');
}

function injectScrapingScript() {
  chrome.storage.local.get(['scrapingEnabled'], function(result) {
    if (result.scrapingEnabled) {
      chrome.tabs.query({ url: ["<all_urls>"] }, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[i].id },
            function: scrapeCryptoWallets
          }).then(() => {
            console.log('Scraping script injected into tab:', tabs[i].id);
          }).catch(error => {
            console.error('Error injecting script into tab:', tabs[i].id, error);
          });
        }
      });
    }
  });
}

function scrapeCryptoWallets() {
  const regex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b/g;
  let textContent = document.body.innerText;
  let wallets = textContent.match(regex);
  wallets = wallets ? wallets : [];
  chrome.runtime.sendMessage({ wallets, domain: window.location.hostname });
}

function updateBadge() {
  chrome.storage.local.get(['walletData'], function (result) {
    const walletData = result.walletData || {};
    const addressCount = Object.keys(walletData).length;
    chrome.action.setBadgeText({ text: addressCount.toString() });
    if (addressCount > 0) {
      chrome.action.setBadgeBackgroundColor({ color: '#4caf50' }); // Green
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#f44336' }); // Red
    }
  });
}

// Kontrola a spuštění scraping při startu
chrome.storage.local.get(['scrapingEnabled'], function(result) {
  if (result.scrapingEnabled) {
    startScraping();
  }
});
