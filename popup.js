document.addEventListener('DOMContentLoaded', function () {
  const extpay = ExtPay('crypto-wallet-scrapper---btc');

  // Check scrapping status and update the UI accordingly
  chrome.storage.local.get(['scrapingEnabled'], function(result) {
    if (result.scrapingEnabled) {
      document.getElementById('status').innerText = 'Scraping is active';
    } else {
      document.getElementById('status').innerText = 'Scraping is stopped';
    }
  });

  document.getElementById('startScraping').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleScraping', enabled: true });
    document.getElementById('status').innerText = 'Scraping is active';
  });

  document.getElementById('stopScraping').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleScraping', enabled: false });
    document.getElementById('status').innerText = 'Scraping is stopped';
  });

  document.getElementById('viewAddresses').addEventListener('click', () => {
    chrome.tabs.create({ url: 'addresses.html' });
  });

  document.getElementById('payButton').addEventListener('click', () => {
    extpay.openPaymentPage();
  });

  document.getElementById('infoButton').addEventListener('click', () => {
    const authorInfo = document.getElementById('author-info');
    authorInfo.style.display = authorInfo.style.display === 'none' ? 'block' : 'none';
  });
});
