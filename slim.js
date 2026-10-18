// Only slim the site when it is framed by this extension's popup; normal tabs are untouched.
if (window !== top && location.ancestorOrigins[0] === 'chrome-extension://' + chrome.runtime.id) {
  document.documentElement.classList.add('wtb-ext');
  const parentOrigin = location.ancestorOrigins[0];
  // Body is stretched to the frame height, so measure the content; 300px floor leaves room for the date picker.
  const height = () => Math.max(300, document.querySelector('.wrapper')?.scrollHeight || 0,
    ...[...document.querySelectorAll('.ac_results')].map(e => e.getBoundingClientRect().bottom + scrollY));
  const report = () => parent.postMessage({ wtbHeight: Math.ceil(height()) }, parentOrigin);
  addEventListener('DOMContentLoaded', () => {
    new ResizeObserver(report).observe(document.querySelector('.wrapper') || document.body);
    // Dropdowns (settings, account, search, date picker) open without resizing the wrapper.
    for (const ev of ['mouseup', 'mouseover', 'keyup']) addEventListener(ev, () => setTimeout(report, 300));
    report();
  });
}
