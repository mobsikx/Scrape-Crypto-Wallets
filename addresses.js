document.addEventListener('DOMContentLoaded', function () {
  const extpay = ExtPay('crypto-wallet-scrapper---btc');

  function checkUserStatus() {
    extpay.getUser().then(user => {
      let licenceStatus = 'inactive';

      if (user.paid && !user.subscriptionCancelAt) {
        licenceStatus = 'active';
      } else if (user.paid && user.subscriptionCancelAt) {
        licenceStatus = 'active (will end)';
      } else if (user.subscriptionStatus === 'past_due') {
        licenceStatus = 'payment required';
      } else if (user.subscriptionStatus === 'canceled') {
        licenceStatus = 'canceled';
      }

      document.getElementById('accountEmail').innerText = user.email;
      document.getElementById('licenceStatus').innerText = licenceStatus;

      if (!user.paid || user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'past_due') {
        document.getElementById('downloadCSV').addEventListener('click', () => {
          extpay.openPaymentPage();
        });
        document.getElementById('copyToClipboard').addEventListener('click', () => {
          extpay.openPaymentPage();
        });
        document.getElementById('downloadJSON').addEventListener('click', () => {
          extpay.openPaymentPage();
        });
      } else {
        document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
        document.getElementById('copyToClipboard').addEventListener('click', copyToClipboard);
        document.getElementById('downloadJSON').addEventListener('click', downloadJSON);
      }
    }).catch(error => {
      console.error('Error fetching user:', error);
    });
  }

  checkUserStatus();

  document.getElementById('clearAddresses').addEventListener('click', () => {
    chrome.storage.local.set({ walletData: {} }, function() {
      displayAddresses({});
      updateBadge();
    });
  });

  document.getElementById('refreshButton').addEventListener('click', () => {
    refreshAddresses();
  });

  function refreshAddresses() {
    chrome.storage.local.get(['walletData'], function(result) {
      displayAddresses(result.walletData || {});
    });
  }

  function displayAddresses(walletData) {
    const tbody = document.querySelector('#addressesTable tbody');
    tbody.innerHTML = '';
    let totalDomains = 0;
    const uniqueDomains = new Set();

    for (let wallet in walletData) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="address-cell">${wallet} <span class="copy-icon" title="Copy to clipboard" data-address="${wallet}">&#x1F4CB;</span></td>
        <td>${walletData[wallet].domains.join(', ')}</td>
      `;
      tbody.appendChild(tr);

      walletData[wallet].domains.forEach(domain => uniqueDomains.add(domain));
      totalDomains += walletData[wallet].domains.length;
    }

    document.getElementById('totalAddresses').innerText = Object.keys(walletData).length;
    document.getElementById('totalDomains').innerText = uniqueDomains.size;

    // Add copy event listener
    document.querySelectorAll('.copy-icon').forEach(icon => {
      icon.addEventListener('click', function (event) {
        const address = event.target.getAttribute('data-address');
        navigator.clipboard.writeText(address).then(() => {
          alert('Address copied to clipboard');
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
  }

  function downloadCSV() {
    chrome.storage.local.get(['walletData'], function(result) {
      const walletData = result.walletData || {};
      const csvContent = 'data:text/csv;charset=utf-8,' +
        'Address,Domains\n' +
        Object.keys(walletData).map(wallet => `${wallet},"${walletData[wallet].domains.join(', ')}"`).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'wallet_addresses.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  function copyToClipboard() {
    chrome.storage.local.get(['walletData'], function(result) {
      const walletData = result.walletData || {};
      const text = Object.keys(walletData).map(wallet => `${wallet}: ${walletData[wallet].domains.join(', ')}`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        alert('Addresses copied to clipboard');
      });
    });
  }

  function downloadJSON() {
    chrome.storage.local.get(['walletData'], function(result) {
      const walletData = result.walletData || {};
      const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(walletData, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonContent);
      link.setAttribute('download', 'wallet_addresses.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  function updateBadge() {
    chrome.storage.local.get(['walletData'], function(result) {
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

  // Auto-refresh every 5 seconds
  setInterval(() => {
    refreshAddresses();
    checkUserStatus();
  }, 5000);

  refreshAddresses();
  updateBadge(); // Update the badge on load
});
