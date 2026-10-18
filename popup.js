const frame = document.querySelector('iframe');
// Load the site only after its cookies are visible to framed JS (see background.js).
chrome.runtime.sendMessage('relax-all').then(() => { frame.src = 'https://www.worldtimebuddy.com/'; });
// Fit the popup to the slimmed site's height (reported by slim.js), capped by Chrome's 600px popup limit.
addEventListener('message', e => {
  if (e.origin !== 'https://www.worldtimebuddy.com' || typeof e.data?.wtbHeight !== 'number') return;
  frame.style.height = e.data.wtbHeight + 'px';
});
