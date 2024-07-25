document.addEventListener('DOMContentLoaded', function () {
  const extpay = ExtPay('crypto-wallet-scrapper---btc');

  document.getElementById('startScraping').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleScraping', enabled: true });
    document.getElementById('status').innerText = 'Scraping is running';
  });

  document.getElementById('stopScraping').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleScraping', enabled: false });
    document.getElementById('status').innerText = 'Scraping is stopped';
  });

  document.getElementById('viewAddresses').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('addresses.html') });
  });

  document.getElementById('payButton').addEventListener('click', () => {
    extpay.openPaymentPage();
  });

  document.getElementById('infoButton').addEventListener('click', () => {
    const infoDiv = document.getElementById('author-info');
    if (infoDiv.style.display === 'none') {
      infoDiv.style.display = 'block';
    } else {
      infoDiv.style.display = 'none';
    }
  });

  // Kontrola stavu scraping při načtení popupu
  chrome.storage.local.get(['scrapingEnabled'], function(result) {
    if (result.scrapingEnabled) {
      document.getElementById('status').innerText = 'Scraping is running';
    } else {
      document.getElementById('status').innerText = 'Scraping is stopped';
    }
  });
});
