const regex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b/g;
let textContent = document.body.innerText;
console.log('Document text content for test:', textContent);
let wallets = textContent.match(regex);
wallets = wallets ? wallets : [];
console.log('Tested wallets:', wallets);
