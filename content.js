const extpay = ExtPay('crypto-wallet-scrapper---btc');

// Function to scrape crypto wallets
function scrapeCryptoWallets() {
  console.log('Injected script to scrape wallets');
  const regex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b/g;
  let textContent = document.body.innerText;
  console.log('Document text content in background:', textContent);
  let wallets = textContent.match(regex);
  wallets = wallets ? wallets : [];
  console.log('Scraped wallets in background:', wallets);
  chrome.runtime.sendMessage({ wallets, domain: window.location.hostname });
}

chrome.storage.local.get(['scrapingEnabled'], function(result) {
  if (result.scrapingEnabled) {
    const scrapeInterval = 30000; // 30 seconds
    setInterval(scrapeCryptoWallets, scrapeInterval);
    scrapeCryptoWallets(); // Initial scrape
  }
});
