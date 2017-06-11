const { html, innerHTML, outerHTML } = window.diff;
const mount = document.querySelector('.playing-card');
const cachedTransactions = new Set();

innerHTML(mount, html`<${Card} width=${400} value=${12} facing />`);
