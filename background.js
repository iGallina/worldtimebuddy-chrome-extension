// Inside the popup's frame the site's JS only sees SameSite=None cookies, but the server sets Lax ones
// (hka_lid, wtbsess, ...). Unseen, the site treats the list as empty and saves over it. Mark them None.
const HOST = 'www.worldtimebuddy.com';

function relax(c) {
  if (c.domain !== HOST || c.sameSite === 'no_restriction') return;
  return chrome.cookies.set({
    url: `https://${HOST}${c.path}`, name: c.name, value: c.value, path: c.path, storeId: c.storeId,
    secure: true, httpOnly: c.httpOnly, sameSite: 'no_restriction', expirationDate: c.expirationDate,
  });
}

chrome.cookies.onChanged.addListener(({ cookie, removed }) => { if (!removed) relax(cookie); });

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg !== 'relax-all') return;
  chrome.cookies.getAll({ domain: HOST }).then(cs => Promise.all(cs.map(relax))).then(() => reply(true));
  return true;
});
