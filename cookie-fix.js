// Runs in the page's own JS world. Inside the extension's frame Chrome only accepts script-written cookies
// marked SameSite=None; Secure, and the site writes plain ones, so its startup check fails and init aborts.
if (window !== top && location.ancestorOrigins[0]?.startsWith('chrome-extension://')) {
  const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => desc.get.call(document),
    set: v => desc.set.call(document, /samesite=/i.test(v) ? v : v + '; SameSite=None; Secure'),
  });
}
